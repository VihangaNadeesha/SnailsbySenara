# Snails by Senara

A premium, mobile-first Next.js storefront for the Snails by Senara press-on nail collection. Checkout uses WhatsApp by default; Supabase-backed products, orders, storage, and staff authorization are optional.

## Stack

- Next.js App Router, TypeScript, React, and Tailwind CSS
- Supabase Postgres, Auth, Storage, and Row Level Security
- Netlify-ready Next.js deployment

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Run `npm run dev`, then visit `http://localhost:3000`. WhatsApp-only checkout needs no Supabase environment variables.

For the optional Supabase-backed mode:

1. Copy `.env.example` to `.env.local`, set the three Supabase values, and set `NEXT_PUBLIC_CHECKOUT_MODE=supabase`.
2. Set up the database and storage using the applicable migrations in `supabase/migrations/`.
3. Create the first user in **Authentication > Users**. Then add their auth UUID to `public.profiles` with a role of `ADMIN`:

   ```sql
   insert into public.profiles (id, role) values ('AUTH_USER_UUID', 'ADMIN');
   ```

4. Insert one `business_settings` row and set all placeholder values. Add products and optional product images to the `product_images` public bucket; store each object path in `product_images.storage_path`. The staff console is at `/admin`.

WhatsApp-only mode uses the local sample catalog. Orders and payment slips are not saved to the website; customers must attach their slips manually in WhatsApp.

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
3. For WhatsApp-only checkout, remove unused Supabase variables from **Site configuration > Environment variables**, and leave `NEXT_PUBLIC_CHECKOUT_MODE` unset. Redeploy after changing variables. Check the local sample catalog and prices before launch.
4. To enable Supabase-backed checkout and catalog instead, set `NEXT_PUBLIC_CHECKOUT_MODE` to `supabase` for the build and add the three values from `.env.example` in Netlify. Keep `SUPABASE_SERVICE_ROLE_KEY` secret and available to server functions. In Supabase Auth, add the Netlify URL and custom domain to Redirect URLs/Site URL.
5. If Netlify's secret scanner fails, inspect the reported variable names and file paths. Do not disable scanning or expose server-only keys. Rotate any exposed secret.

## Business-owner configuration still required

For WhatsApp-only mode, review the local catalog, delivery fee, bank details, and WhatsApp number before launch. In Supabase mode, configure the `business_settings` row and product records. Review the imagery, story, and FAQ answers before launch.
