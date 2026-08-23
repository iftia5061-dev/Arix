# ARIX

ARIX is a Firebase Spark-compatible product showcase and storefront. Firebase is used only for Auth and Firestore. Gumroad is the sole payment and digital-delivery provider.

## Payment flow

```text
ARIX product → Buy Now → Gumroad product page → customer pays → Gumroad delivers
```

The frontend never calls a payment API, Cloud Function, webhook, or success-page access check. A Buy Now link opens the product's `links.checkoutUrl` in a new tab.

## Product data

All product normalization, validation, form conversion, price formatting, and public visibility checks live in `src/data/productSchema.js`.

- **For sale** products require a price and Gumroad checkout URL. Web design and SaaS products also require a demo URL; software, mobile apps, AI, and tools can use screenshots without a demo.
- **Showcase** products have no price or checkout URL and never display a Buy Now action.
- In the Admin form, enter normal prices: `20` means `$20.00`; `29.99` means `$29.99`. Do not enter cents.
- Cover and gallery images must use externally hosted `http` or `https` URLs.

## Admin setup

1. In Firestore, create `admins/{Firebase Auth UID}` with `{ "role": "admin" }`.
2. Deploy the Firestore rules.
3. Sign in at `/admin` and add products. Drafts remain private; publishing shows a precise list of missing fields.
4. Before publishing a sale product, open its Gumroad URL manually and confirm it is the correct product.

## Firestore access

- Visitors can read only public products.
- Admins can list, create, edit, delete, publish, and unpublish all products, including drafts.
- A signed-in user can access only `users/{uid}` for their own UID.

## Local verification

```bash
npm run lint
npm run build
```

Deploy the frontend to Vercel after these checks. If Firestore rules changed, deploy the rules separately with the Firebase CLI. No Firebase Functions, Secrets, Storage delivery, Gumroad webhook, or payment-verification deployment is required.
