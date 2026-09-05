# ARIX

ARIX is a Firebase Spark-compatible product showcase and storefront. Firebase is used only for Auth and Firestore. Gumroad handles payment and digital delivery for instantly purchasable products.

## Payment flow

```text
ARIX product → Buy Now → Gumroad product page → customer pays → Gumroad delivers
```

The frontend never calls a payment API, Cloud Function, webhook, or success-page access check. A Buy Now link opens the product's `links.checkoutUrl` in a new tab.

## Custom service orders

```text
Service plan → Order Now → verified Firestore plan → pending order → Admin Dashboard
```

- Package links contain only a plan ID; they never contain a price.
- The Contact page reads the current plan and price from `orderPlans` in Firestore immediately before writing an order.
- Firestore rules compare every saved plan/price field to that same `orderPlans` document, so a manipulated client or URL cannot change the submitted price.
- A plain `/contact` request remains a custom quote with no price attached.

## Product data

All product normalization, validation, form conversion, price formatting, and public visibility checks live in `src/data/productSchema.js`.

- **For sale** products require a price and Gumroad checkout URL. Web design and SaaS products also require a demo URL; software, mobile apps, AI, and tools can use screenshots without a demo.
- **Showcase** products have no price or checkout URL and never display a Buy Now action.
- In the Admin form, enter normal prices: `20` means `$20.00`; `29.99` means `$29.99`. Do not enter cents.
- Cover and gallery images must use externally hosted `http` or `https` URLs.

## Admin setup

1. In Firestore, create `admins/{Firebase Auth UID}` with `{ "role": "admin" }`.
2. Deploy the Firestore rules.
3. Sign in at `/admin` and select **Save missing service plans** once. The action creates the current package records in `orderPlans` without overwriting existing database prices.
4. Add products. Drafts remain private; publishing shows a precise list of missing fields.
5. Before publishing a sale product, open its Gumroad URL manually and confirm it is the correct product.

## Firestore access

- Visitors can read only public products.
- Visitors can read active service plans and create validated orders and ratings; they cannot read orders.
- Admins can view all orders and service plans.
- Admins can list, create, edit, delete, publish, and unpublish all products, including drafts.
- A signed-in user can access only `users/{uid}` for their own UID.

## Local verification

```bash
npm run lint
npm run build
```

Deploy the frontend to Vercel after these checks. If Firestore rules changed, deploy the rules separately with the Firebase CLI. No Firebase Functions, Secrets, Storage delivery, Gumroad webhook, or payment-verification deployment is required.
