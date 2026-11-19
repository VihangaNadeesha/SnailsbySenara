# 🗄️ Supabase Setup Guide for Snails by Senara

## Overview
This guide will help you set up a complete Supabase database for managing products, orders, payments, and customers.

---

## ✅ STEP 1: Create a Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"** (top right)
3. Sign up with **Email** or **GitHub**
4. Create a new organization (or use existing)
5. Click **"New Project"**

**Fill in:**
- **Project Name:** `snails-by-senara`
- **Database Password:** Create a strong password (⚠️ SAVE THIS!)
- **Region:** `Singapore` (closest to Sri Lanka) or your preferred region
- Click **"Create new project"**

⏱️ **Wait 2-3 minutes for initialization...**

---

## ✅ STEP 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** (bottom left sidebar)
2. Click **"API"**
3. Copy these values and save them:

```
📋 Project URL:
https://xxxxxxxxxxxx.supabase.co

🔑 anon (public) key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔐 service_role (private) key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ STEP 3: Update Your Environment Variables

Edit the `.env.local` file in your project root:

```bash
# Replace YOUR VALUES with the credentials from Step 2
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep existing Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

**Save the file. No restart needed yet.**

---

## ✅ STEP 4: Create Database Tables

### **Option A: Using SQL Editor (Recommended)**

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from: `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **"RUN"** (top right)
6. ✅ Wait for success message

### **Option B: Using UI (Manual)**

If you prefer creating tables manually in the UI:
1. Go to **Tables** (left sidebar)
2. Click **"Create a new table"**
3. Create each table as defined in `schema.sql`
(This is more tedious, so Option A is recommended)

---

## ✅ STEP 5: Set Up Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**

**Create these buckets:**

### **Bucket 1: Product Images**
- **Name:** `product-images`
- **Public:** ✅ Yes (so images display publicly)
- Click **"Create bucket"**

### **Bucket 2: Payment Slips**
- **Name:** `payment-slips`
- **Public:** ❌ No (payment proofs should be private)
- Click **"Create bucket"**

---

## ✅ STEP 6: Upload Your Nail Images to Storage

1. Go to **Storage** → **product-images** bucket
2. Click **"Upload a file"** or **"Upload a folder"**
3. Navigate to your local `/public/nails/` folder
4. Select all 21 nail images (nail-01.png through nail-21.png)
5. Click **"Upload"**

✅ All images are now in the cloud!

---

## ✅ STEP 7: Insert Product Data

Now we'll add all 21 nail products to the database.

1. Go to **SQL Editor** → **New Query**
2. Copy this SQL and paste it:

```sql
-- Insert all 21 nail products
INSERT INTO products (name, slug, description, price, inventory, is_available, display_order) VALUES
('Classic French', 'classic-french', 'Timeless white tips on a soft nude base. Perfect for every occasion.', 2290, 10, true, 1),
('Rosé Glaze', 'rose-glaze', 'A sheer pink set with a luminous glazed finish for a soft glow.', 2490, 8, true, 2),
('Cherry Blossom', 'cherry-blossom', 'Glossy pink nails with delicate floral details and shimmer.', 2690, 6, true, 3),
('Midnight Matte', 'midnight-matte', 'Deep black matte finish with a sophisticated edge.', 2390, 7, true, 4),
('Gold Luxe', 'gold-luxe', 'Rich gold metallic with intricate nail art details.', 2790, 5, true, 5),
('Blush Marble', 'blush-marble', 'Soft pink with elegant marble swirls for a modern look.', 2590, 9, true, 6),
('Peach Paradise', 'peach-paradise', 'Warm peachy tone with sparkling accents and depth.', 2490, 8, true, 7),
('Coral Sunset', 'coral-sunset', 'Vibrant coral gradient that captures the essence of a sunset.', 2590, 6, true, 8),
('Lavender Dreams', 'lavender-dreams', 'Soft lavender with mystical undertones and shimmer.', 2490, 7, true, 9),
('Deep Burgundy', 'deep-burgundy', 'Rich wine red with glossy finish for an elegant statement.', 2590, 8, true, 10),
('Silver Sparkle', 'silver-sparkle', 'Dazzling silver glitter that catches every light.', 2690, 5, true, 11),
('Nude Elegance', 'nude-elegance', 'Perfectly neutral nude shade for a clean, chic look.', 2290, 12, true, 12),
('Mint Fresh', 'mint-fresh', 'Cool mint green with a refreshing pastel aesthetic.', 2490, 9, true, 13),
('Rose Gold Glam', 'rose-gold-glam', 'Warm rose gold with luxe metallic finish and shine.', 2790, 6, true, 14),
('Chocolate Velvet', 'chocolate-velvet', 'Deep chocolate brown with ultra-smooth velvet matte finish.', 2490, 7, true, 15),
('Pearl Opalescent', 'pearl-opalescent', 'Iridescent pearl finish with multi-dimensional color shifts.', 2890, 4, true, 16),
('Berry Bliss', 'berry-bliss', 'Deep berry tones with a glossy, juicy finish.', 2590, 8, true, 17),
('Cream Dreamer', 'cream-dreamer', 'Soft cream with delicate nail art and subtle details.', 2390, 10, true, 18),
('Sapphire Nights', 'sapphire-nights', 'Deep sapphire blue with sparkling crystal accents.', 2690, 5, true, 19),
('Blush & Lace', 'blush-and-lace', 'Delicate blush with intricate lace details for romance.', 2590, 7, true, 20),
('Sunset Ombre', 'sunset-ombre', 'Stunning orange to pink ombre gradient with golden accents.', 2790, 6, true, 21);

-- Insert product images for each product
-- For now, we'll insert basic references. You can update these after uploading to storage.
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-01.png', 0 FROM products WHERE slug = 'classic-french';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-02.png', 0 FROM products WHERE slug = 'rose-glaze';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-03.png', 0 FROM products WHERE slug = 'cherry-blossom';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-04.png', 0 FROM products WHERE slug = 'midnight-matte';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-05.png', 0 FROM products WHERE slug = 'gold-luxe';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-06.png', 0 FROM products WHERE slug = 'blush-marble';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-07.png', 0 FROM products WHERE slug = 'peach-paradise';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-08.png', 0 FROM products WHERE slug = 'coral-sunset';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-09.png', 0 FROM products WHERE slug = 'lavender-dreams';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-10.png', 0 FROM products WHERE slug = 'deep-burgundy';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-11.png', 0 FROM products WHERE slug = 'silver-sparkle';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-12.png', 0 FROM products WHERE slug = 'nude-elegance';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-13.png', 0 FROM products WHERE slug = 'mint-fresh';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-14.png', 0 FROM products WHERE slug = 'rose-gold-glam';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-15.png', 0 FROM products WHERE slug = 'chocolate-velvet';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-16.png', 0 FROM products WHERE slug = 'pearl-opalescent';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-17.png', 0 FROM products WHERE slug = 'berry-bliss';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-18.png', 0 FROM products WHERE slug = 'cream-dreamer';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-19.png', 0 FROM products WHERE slug = 'sapphire-nights';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-20.png', 0 FROM products WHERE slug = 'blush-and-lace';
INSERT INTO product_images (product_id, storage_path, display_order) 
SELECT id, 'product-images/nail-21.png', 0 FROM products WHERE slug = 'sunset-ombre';
```

3. Click **"RUN"**
4. ✅ All 21 products are now in your database!

---

## ✅ STEP 8: Verify Everything is Set Up

In Supabase:
1. Go to **Tables**
2. Click **"products"** → You should see 21 rows
3. Click **"product_images"** → You should see 21 rows
4. Click **"business_settings"** → You should see 1 row

---

## ✅ STEP 9: Update Your App Code

Now we need to update the app to use Supabase instead of demo data.

The app structure already supports this! Look at:
- `/lib/store.ts` - Already fetches from Supabase!
- `/lib/supabase/server.ts` - Supabase client setup

Your app will **automatically** fetch products from Supabase if the connection works.

---

## ✅ STEP 10: Test the Connection

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to:** http://localhost:3000/#shop

3. **You should see:**
   - ✅ All 21 products loaded from database
   - ✅ Product images displaying correctly
   - ✅ Prices and descriptions showing

---

## 📊 Database Schema Overview

```
products (21 records)
├── id, name, slug, description, price, inventory, is_available, display_order
└── product_images (21 records)
    └── product_id, storage_path, display_order

orders (created when customers checkout)
├── order_number, customer_name, customer_phone, delivery_address
├── subtotal, delivery_fee, total_amount, status
└── order_items (line items for each product in order)
    └── product_id, selected_size, quantity, unit_price

payment_slips (uploaded when customer pays)
├── order_id, file_name, storage_path
└── verification_status (pending/verified/rejected)

business_settings (1 record)
└── bank_name, account_number, delivery_fee, whatsapp_number, etc.
```

---

## 🎯 What Happens Next

After setup, when a customer:
1. **Browses:** Products load from `products` table ✅
2. **Adds to cart:** Items stored in browser session ✅
3. **Checks out:** New `order` record created with status = `pending`
4. **Uploads slip:** New `payment_slip` record created
5. **Admin verifies:** Status changes to `paid` or `rejected`
6. **Order shipped:** Status updates to `processing`, `shipped`, `delivered`

---

## 🆘 Troubleshooting

**Q: "Connection refused" error?**
- Check `.env.local` - make sure URLs and keys are correct
- Restart dev server: `npm run dev`

**Q: Images not showing?**
- Verify storage bucket is public
- Check if images are actually uploaded to storage
- Verify storage_path in database matches uploaded files

**Q: Can't insert products?**
- Make sure RLS policies are enabled
- Try running SQL queries as admin (not through client)

---

## ✨ Next Steps (Optional)

1. **Admin Dashboard:** Create a page to manage orders and verify payments
2. **Email Notifications:** Send order confirmations to customers
3. **Inventory Alerts:** Get notified when stock is low
4. **Order Tracking:** Let customers track order status

---

**You're all set! 🎉 Ready to proceed?**
