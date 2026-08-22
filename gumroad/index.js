const crypto = require("crypto");
const admin = require("firebase-admin");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const db = admin.firestore();
const GUMROAD_ACCESS_TOKEN = defineSecret("GUMROAD_ACCESS_TOKEN");
const CHECKOUT_TOKEN_FIELD = "arix_checkout_token";

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function eventId(saleId) {
  return crypto.createHash("sha256").update(asString(saleId)).digest("hex");
}

function checkoutTokenFromSale(sale) {
  const safeSale = sale || {};
  if (asString(safeSale[CHECKOUT_TOKEN_FIELD])) {
    return asString(safeSale[CHECKOUT_TOKEN_FIELD]);
  }

  const fields = safeSale.custom_fields;
  if (Array.isArray(fields)) {
    const field = fields.find((item) =>
      asString((item || {}).name || (item || {}).key) === CHECKOUT_TOKEN_FIELD);
    return asString((field || {}).value);
  }

  if (fields && typeof fields === "object") {
    return asString(fields[CHECKOUT_TOKEN_FIELD]);
  }
  return "";
}

function isRevoked(sale) {
  const trueValue = (value) =>
    value === true || value === "true" || value === "1";
  const safeSale = sale || {};
  return trueValue(safeSale.refunded) || trueValue(safeSale.disputed) ||
    trueValue(safeSale.chargebacked) || Boolean(safeSale.subscription_failed_at);
}

async function getVerifiedSale(saleId) {
  const token = GUMROAD_ACCESS_TOKEN.value();
  if (!token) throw new Error("GUMROAD_ACCESS_TOKEN is not configured.");

  const response = await fetch(
      `https://api.gumroad.com/v2/sales/${encodeURIComponent(saleId)}`,
      {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: AbortSignal.timeout(10000),
      },
  );
  if (!response.ok) throw new Error(`Gumroad API returned ${response.status}.`);

  const body = await response.json();
  const sale = (body || {}).sale || (body || {}).data || body;
  if ((body || {}).success === false || !sale || asString(sale.id) !== saleId) {
    throw new Error("Gumroad could not verify this sale.");
  }
  return sale;
}

exports.gumroadWebhook = onRequest(
    {
      region: "us-central1",
      invoker: "public",
      secrets: [GUMROAD_ACCESS_TOKEN],
      maxInstances: 10,
    },
    async (req, res) => {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const requestBody = req.body || {};
      const saleId = asString(requestBody.sale_id || requestBody.id);
      logger.info("Gumroad webhook received", {
        method: req.method,
        saleId: saleId || "missing",
      });
      if (!saleId || saleId.length > 300) {
        return res.status(400).send("Missing sale id");
      }

      let sale;
      try {
        // The webhook body is untrusted. ARIX checks the real sale again
        // through the seller-authorized Gumroad API before changing an order.
        sale = await getVerifiedSale(saleId);
      } catch (error) {
        logger.error("Gumroad sale verification failed", {message: error.message});
        return res.status(503).send("Verification unavailable");
      }

      const checkoutToken = checkoutTokenFromSale(sale);
      if (!checkoutToken || !/^[A-Za-z0-9_-]{40,}$/.test(checkoutToken)) {
        logger.warn("Ignoring unlinked Gumroad sale", {saleId});
        return res.status(202).send("Unlinked sale ignored");
      }

      const orderRef = db.collection("orders").doc(checkoutToken);
      const paymentEventRef = db.collection("paymentEvents").doc(eventId(saleId));

      try {
        await db.runTransaction(async (transaction) => {
          const [orderSnapshot, eventSnapshot] = await Promise.all([
            transaction.get(orderRef),
            transaction.get(paymentEventRef),
          ]);
          if (!orderSnapshot.exists) {
            transaction.set(paymentEventRef, {
              saleId,
              outcome: "no_matching_order",
              receivedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
          }

          const order = orderSnapshot.data();
          if (order.paymentProvider !== "gumroad" ||
            (order.transactionId && order.transactionId !== saleId)) {
            transaction.set(paymentEventRef, {
              saleId,
              outcome: "order_mismatch",
              receivedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
          }

          const matchesOrder = asString(sale.product_id) ===
              asString(order.gumroadProductId) &&
            Number(sale.price) === order.amount &&
            asString(sale.currency).toUpperCase() ===
              asString(order.currency).toUpperCase();
          const revoked = isRevoked(sale);
          const status = matchesOrder && !revoked ? "paid" :
            revoked ? "refunded" : "failed";
          const paymentEvent = {
            saleId,
            verified: matchesOrder,
            status,
            receivedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          transaction.set(
              paymentEventRef,
              eventSnapshot.exists ? {
                ...paymentEvent,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              } : paymentEvent,
              {merge: true},
          );
          transaction.update(orderRef, {
            transactionId: saleId,
            status,
            ...(status === "paid" ? {
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
            } : {}),
            ...(status === "refunded" ? {
              refundedAt: admin.firestore.FieldValue.serverTimestamp(),
            } : {}),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        return res.status(200).json({success: true, message: "Gumroad webhook verified"});
      } catch (error) {
        logger.error("Gumroad webhook order update failed", {message: error.message});
        return res.status(500).json({success: false, message: "Webhook processing failed"});
      }
    },
);
