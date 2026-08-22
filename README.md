# ARIX marketplace

ARIX has two deliberately different product types:

- **For sale**: a signed-in customer is sent to Gumroad. Only a server-side, Gumroad-verified webhook changes their Firebase order to `paid`; only then can they receive a private delivery link.
- **Showcase**: displays ARIX work and an optional demo only. It has no price, checkout, payment, download, or access action.

The browser never decides whether payment succeeded. `/payment/complete` is informational only and cannot grant access.

## Data architecture

| Collection | Who can access it | Purpose |
| --- | --- | --- |
| `products` | public only when ready + published | product copy, screenshots, pricing, demo and checkout metadata |
| `productAssets` | Firebase admins / Functions only | private Firebase Storage file path or private app-access URL |
| `orders` | owner of the order, admin, Functions | `pending`, `paid`, `failed`, or `refunded` purchase records |
| `paymentEvents` | admin, Functions only | Gumroad webhook audit trail |

All sale prices are stored once as `pricing.amount` in the smallest currency unit (`2900` = USD 29.00). The same exact value must be configured in Gumroad. A webhook with a different product ID, currency, amount, refund, dispute, or chargeback does **not** unlock access.

## Product publishing workflow

1. Build and test the real product.
2. Upload real screenshots and create a working demo.
3. Create the Gumroad product, collect its immutable product ID, and configure the custom checkout field below.
4. Upload the release file to the private `releases/…` Firebase Storage path—or configure a protected app-access URL.
5. In `/admin`, create the product as a **draft**. Fill every required field and private delivery setting.
6. Check the preview and product page. Only then publish it.

The admin UI and Firestore Rules both refuse an incomplete published product. A sale cannot publish without screenshots, demo, exact price, Gumroad checkout, Gumroad product ID, and private delivery configuration.

## Gumroad webhook setup (required)

1. Create a Gumroad API access token with sales access. Keep it secret.
2. For **each Gumroad product sold through ARIX**, create an optional text custom field named exactly:

   ```text
   arix_checkout_token
   ```

   ARIX adds an unguessable, one-use value to this field when checkout starts. It binds the completed Gumroad sale to the Firebase account that started it. Do not rename the field.
3. Set the Firebase secret after installing the Functions dependencies:

   ```powershell
   cd functions
   npm install
   firebase functions:secrets:set GUMROAD_ACCESS_TOKEN
   ```

4. Deploy Functions, then use the resulting `gumroadWebhook` URL as the Gumroad webhook endpoint. For this Firebase project it will normally be:

   ```text
   https://us-central1-arix-website.cloudfunctions.net/gumroadWebhook
   ```

5. In Gumroad, subscribe this endpoint to at least `sale`, `refund`, and `dispute` events (also use `cancellation` and `subscription_ended` for subscriptions). Gumroad’s resource subscription API can register them; Gumroad Ping may be used for a sale notification if that is what your account exposes.

The endpoint ignores the untrusted request body other than the sale ID. It retrieves the sale again through the seller-authorized Gumroad API, then checks its product ID, amount, currency, refund/dispute state, and checkout token before updating Firebase.

## Firebase deployment

Install the web app and Functions dependencies, then deploy rules, storage rules, and Functions:

```powershell
npm install
cd functions
npm install
cd ..
npm run build
firebase deploy --only firestore:rules,storage,functions
```

Cloud Functions and V4 Cloud Storage signed URLs require a Firebase project with billing enabled. The `storage.rules` file intentionally blocks every direct release-file read. Upload release files in the Firebase/Google Cloud console (or a future admin upload Function) under the same `releases/...` path entered in `/admin`; never use a public Firebase download URL, public GitHub release, or public repository as paid delivery.

For an **access** product rather than a file, the target application must independently require ARIX/Firebase authentication and check the customer’s paid entitlement. ARIX only releases that destination after order verification; a plain publicly usable destination URL is not a secure access control.

### First admin

1. Sign in once with the chosen Google account.
2. Copy its Firebase Auth UID.
3. In Firestore, create `admins/<UID>` with `{ role: 'admin' }`.

Rules enforce this server-side; the UI check is only for usability.

## Customer flow

```text
ARIX Buy Now (signed in)
  → server creates pending Firebase order + unguessable checkout token
  → Gumroad checkout
  → Gumroad webhook
  → server verifies the sale directly with Gumroad API
  → Firebase order = paid
  → My Purchases
  → server issues a 15-minute private download URL / protected app access
```

Someone adding `?success=true` to any URL, visiting the payment-complete page, guessing an order URL, or calling a delivery function without the paid order owner’s Firebase ID token gets no access.

## Local development

```powershell
npm install
npm run dev
```

For end-to-end payment testing, use Firebase emulators only with a safe Gumroad test flow or deploy the webhook to a non-production Firebase project. A real Gumroad webhook cannot reach localhost.
