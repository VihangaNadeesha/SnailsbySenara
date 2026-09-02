# Snails by Senara

A premium, mobile-first Next.js storefront for the Snails by Senara press-on nail collection. It keeps customers on one page, with a cart drawer and an in-place manual bank-transfer checkout, while Supabase provides products, orders, storage, and staff authorization.

## Stack

- Next.js App Router, TypeScript, React, and Tailwind CSS
- Supabase Postgres, Auth, Storage, and Row Level Security
- Netlify-ready Next.js deployment

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and set the three Supabase values.
3. Create a Supabase project, then run `supabase/migrations/20260902000000_initial_schema.sql` in the Supabase SQL editor (or use the Supabase CLI).
4. Create the first user in **Authentication > Users**. Then add their auth UUID to `public.profiles` with a role of `ADMIN`:

   ```sql
   insert into public.profiles (id, role) values ('AUTH_USER_UUID', 'ADMIN');
   ```

5. Insert one `business_settings` row and set all placeholder values. Add products and optional product images to the `product_images` public bucket; store each object path in `product_images.storage_path`.
6. Run `npm run dev`, then visit `http://localhost:3000`. The staff console is at `/admin`.

Without Supabase environment variables, the storefront intentionally shows clearly demo-labelled in-code sample products so the visual experience can be reviewed; order submission also returns a demo order number. Configure Supabase before production.

## Storage and security

The migration creates a public `product_images` bucket and a **private** `payment_slips` bucket. Payment slips are accepted by the server endpoint only after image type and 5 MB size checks. Their paths—not binaries or public URLs—are stored in Postgres. The service-role key is server-only and must never be prefixed with `NEXT_PUBLIC_`.

RLS allows public reads only for available products, product images, and storefront settings. Orders, order items, payment slips, approval history, and management actions are restricted to staff profiles. The server validates current product availability, sizes, inventory, prices, delivery fee, and totals before it writes an order. Approval is a two-stage, role-checked server action; final approval sets `approved_at`, while `submitted_at` remains intact.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Deploying to Netlify

1. Push this repository and create a new Netlify site from it.
2. Use build command `npm run build` and publish directory `.next` (Netlify detects Next.js automatically; install its Next.js runtime if prompted).
3. Add the three values from `.env.example` in **Site configuration > Environment variables**. Keep `SUPABASE_SERVICE_ROLE_KEY` secret.
4. In Supabase Auth, add the Netlify URL and your custom domain to Redirect URLs/Site URL.
5. Configure the custom domain in Netlify and update the Supabase Auth URLs once DNS is live.

## Business-owner configuration still required

Replace all bracketed placeholders in the single `business_settings` row: bank details, delivery information/fee, WhatsApp number, Google review URL, and social URLs. Add real product imagery, product records, Senara's approved story/images, and approved FAQ answers before launch. Do not add real bank data to source code.
