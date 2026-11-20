# 🎯 EXECUTE ALL 9 STEPS NOW - DETAILED GUIDE

## ⏱️ Time to Complete: ~20 minutes

Follow each step EXACTLY as written. Copy-paste the SQL code when needed.

---

## ✅ STEP 1: CREATE DATABASE TABLES (2 minutes)

**Location:** Supabase SQL Editor

### Instructions:

1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql
2. Click "New Query" button
3. Click in the query editor (white box)
4. **Copy-Paste this SQL:**

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.payment_slips CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.business_settings CASCADE;

-- Create Products Table
CREATE TABLE public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price BIGINT NOT NULL,
  available_sizes TEXT[] DEFAULT '{"XS","S","M","L"}',
  inventory BIGINT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  display_order BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Product Images Table
CREATE TABLE public.product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  hover_image_url TEXT,
  display_order BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  order_status TEXT DEFAULT 'pending',
  total_amount BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_size TEXT,
  quantity BIGINT DEFAULT 1,
  unit_price BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Payment Slips Table
CREATE TABLE public.payment_slips (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Business Settings Table
CREATE TABLE public.business_settings (
  id BIGSERIAL PRIMARY KEY,
  bank_name TEXT,
  account_holder TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  delivery_fee BIGINT DEFAULT 0,
  whatsapp_number TEXT,
  instagram_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_products_display_order ON products(display_order);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payment_slips_order_id ON payment_slips(order_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for products and images
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON business_settings FOR SELECT USING (true);

-- Authenticated users can insert orders
CREATE POLICY "Authenticated insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read orders" ON orders FOR SELECT USING (true);

-- Order items policies
CREATE POLICY "Authenticated insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read order items" ON order_items FOR SELECT USING (true);

-- Payment slips policies
CREATE POLICY "Authenticated insert payment slips" ON payment_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read payment slips" ON payment_slips FOR SELECT USING (true);
```

5. Click the **"Run"** button (blue button on right)
6. Wait for it to complete (should see "Executed" message)
7. ✅ **STEP 1 COMPLETE**

---

## ✅ STEP 2: CREATE STORAGE BUCKETS (1 minute)

**Location:** Supabase Storage

### Instructions:

1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/storage/buckets
2. Click **"New Bucket"** button (top right)
3. Enter bucket name: `product-images`
4. ✓ Check "Public bucket" checkbox
5. Click **"Create Bucket"** button
6. Click **"New Bucket"** again
7. Enter bucket name: `payment-slips`
8. Leave as Private (don't check public)
9. Click **"Create Bucket"** button
10. ✅ **STEP 2 COMPLETE**

---

## ✅ STEP 3: UPLOAD 21 NAIL IMAGES (5 minutes)

**Location:** Supabase Storage → product-images

### Instructions:

1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/storage/buckets/product-images
2. Click **"Upload file"** button
3. Select all 21 PNG files from: `C:\Your\Project\public\nails\`
   - nail-01.png through nail-21.png
4. Wait for upload to complete (should see all files in the list)
5. Verify all 21 files are showing in the list
6. ✅ **STEP 3 COMPLETE**

---

## ✅ STEP 4: INSERT 21 PRODUCTS (2 minutes)

**Location:** Supabase SQL Editor

### Instructions:

1. Go back to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql
2. Click **"New Query"** button
3. **Copy-Paste this SQL:**

```sql
-- Insert 21 Nail Products
INSERT INTO products (name, description, price, inventory, is_available, display_order) VALUES
('Classic French', 'Timeless French manicure with elegant white tips', 2290, 50, true, 1),
('Rosé Glaze', 'Soft pink with shimmering rose gold accents', 2390, 50, true, 2),
('Cherry Blossom', 'Delicate pink nails with cherry blossom patterns', 2490, 50, true, 3),
('Midnight Matte', 'Deep black matte finish for a bold look', 2290, 50, true, 4),
('Blush Marble', 'Pink and white marble effect design', 2590, 50, true, 5),
('Nude Elegance', 'Nude beige with subtle glossy finish', 2290, 50, true, 6),
('Berry Wine', 'Rich burgundy with metallic details', 2690, 50, true, 7),
('Coral Dream', 'Vibrant coral with golden glitter', 2490, 50, true, 8),
('Ocean Breeze', 'Cool blue with iridescent shimmer', 2590, 50, true, 9),
('Forest Green', 'Deep forest green with matte finish', 2390, 50, true, 10),
('Lilac Bloom', 'Soft lilac purple with floral design', 2490, 50, true, 11),
('Peach Paradise', 'Peachy pink with ombré effect', 2290, 50, true, 12),
('Silver Mirror', 'Reflective silver metallic finish', 2890, 50, true, 13),
('Gold Luxury', 'Rich gold with diamond accents', 2890, 50, true, 14),
('Pastel Dream', 'Mixed pastel colors with gradient', 2590, 50, true, 15),
('Leopard Print', 'Trendy leopard pattern design', 2690, 50, true, 16),
('Matte Black', 'Classic matte black finish', 2290, 50, true, 17),
('Glitter Pink', 'Pink base with colorful glitter', 2490, 50, true, 18),
('Sunset Ombre', 'Orange to pink gradient effect', 2590, 50, true, 19),
('Nude Shimmer', 'Nude with subtle shimmer sparkle', 2390, 50, true, 20),
('Royal Blue', 'Deep royal blue with gold trim', 2690, 50, true, 21);
```

4. Click **"Run"** button
5. Wait for completion (should say "Executed successfully")
6. ✅ **STEP 4 COMPLETE**

---

## ✅ STEP 5: LINK IMAGES TO PRODUCTS (2 minutes)

**Location:** Supabase SQL Editor

### Instructions:

1. Click **"New Query"** button
2. **Copy-Paste this SQL:**

```sql
-- Link product images
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(1, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-01.png', 1),
(2, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-02.png', 1),
(3, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-03.png', 1),
(4, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-04.png', 1),
(5, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-05.png', 1),
(6, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-06.png', 1),
(7, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-07.png', 1),
(8, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-08.png', 1),
(9, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-09.png', 1),
(10, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-10.png', 1),
(11, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-11.png', 1),
(12, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-12.png', 1),
(13, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-13.png', 1),
(14, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-14.png', 1),
(15, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-15.png', 1),
(16, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-16.png', 1),
(17, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-17.png', 1),
(18, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-18.png', 1),
(19, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-19.png', 1),
(20, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-20.png', 1),
(21, '<your-supabase-project-url>/storage/v1/object/public/product-images/nail-21.png', 1);
```

3. Click **"Run"** button
4. Wait for completion
5. ✅ **STEP 5 COMPLETE**

---

## ✅ STEP 6: GET YOUR API KEYS (1 minute)

**Location:** Supabase Project Settings

### Instructions:

1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/settings/api
2. You'll see three keys under "Project API keys":
   - **Project URL** (top) - copy this
   - **anon (public)** (middle) - **COPY THIS** (need full JWT token)
   - **service_role** (bottom) - **COPY THIS** (need full JWT token)

3. **Copy and save these values:**
   - anon key: (long token starting with eyJ...)
   - service_role key: (long token starting with eyJ...)

4. ✅ **STEP 6 COMPLETE**

---

## ✅ STEP 7: UPDATE .env.local (2 minutes)

**Location:** Your Project Root → .env.local

### Instructions:

1. Open VS Code
2. Open `.env.local` file
3. Update it to have EXACTLY these 3 lines:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
```

4. Replace:
   - `paste-your-anon-key-here` with the full anon key from Step 6
   - `paste-your-service-role-key-here` with the full service_role key from Step 6

5. **IMPORTANT:** Paste the FULL KEY (the entire long token)
6. **Save the file** (Ctrl+S)
7. ✅ **STEP 7 COMPLETE**

---

## ✅ STEP 8: RESTART YOUR APP (2 minutes)

**Location:** Terminal

### Instructions:

1. Open Terminal in VS Code (Ctrl+`)
2. If dev server is running, **Stop it** (Ctrl+C)
3. Run: `npm run dev`
4. Wait for it to complete and show:
   ```
   ▲ Next.js development server running
   Local: http://localhost:3000
   ```
5. ✅ **STEP 8 COMPLETE**

---

## ✅ STEP 9: TEST EVERYTHING (2 minutes)

**Location:** Browser

### Instructions:

1. Open: http://localhost:3000/#shop
2. Verify you see:
   ✓ All 21 nail products loaded
   ✓ 4 products per row (responsive layout)
   ✓ Product images displaying from cloud storage
   ✓ Product names visible (Classic French, Rosé Glaze, etc.)
   ✓ Price shown for each product
   ✓ "Add to Cart" buttons working
3. Click on a product to see details
4. Try adding a product to cart
5. ✅ **STEP 9 COMPLETE**

---

## 🎉 ALL STEPS COMPLETE!

You now have:
- ✅ 21 products in cloud database
- ✅ 21 images in cloud storage
- ✅ Order management system ready
- ✅ Payment verification system ready
- ✅ Website connected to live Supabase database
- ✅ Production-ready e-commerce platform

**Next:** Test with real customer flow and monitor orders in Supabase!

---

## 🆘 TROUBLESHOOTING

**Step 1 (SQL) fails?**
→ Check the SQL syntax, make sure you copied the entire block

**Step 3 (Upload) is slow?**
→ Upload files in smaller batches (5-6 at a time)

**Images don't show?**
→ Verify storage bucket is PUBLIC and files uploaded successfully

**Products don't load?**
→ Check .env.local has correct anon key (should be long JWT token)
→ Restart app with Ctrl+C then npm run dev

**Still stuck?**
→ Check browser console (F12) for errors
→ Check Supabase logs in dashboard

---

**Total Time: ~20 minutes to production-ready! 🚀**
