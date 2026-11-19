# 🚀 SUPABASE SETUP - MANUAL STEPS

## Your Project Details
- **Project Name:** VihangaNadeesha's Project
- **Project URL:** https://tcjwvnxshhwsmibdwcoh.supabase.co
- **Status:** ✅ Healthy

---

## STEP 1: Create Database Tables

1. **Open Supabase Dashboard:**
   - Go to: https://app.supabase.com/
   - Select: "VihangaNadeesha's Project"

2. **SQL Editor:**
   - Click: **SQL Editor** (left sidebar)
   - Click: **New Query** (top right)

3. **Copy & Paste Schema:**
   - Open file: `supabase/schema.sql` in your project
   - Copy the ENTIRE contents
   - Paste into the SQL Editor
   - Click: **RUN** (top right button)
   - ✅ Wait for success message

**What this creates:**
- ✅ products (21 items)
- ✅ product_images (21 images)
- ✅ orders (customer orders)
- ✅ order_items (line items)
- ✅ payment_slips (payment proofs)
- ✅ business_settings

---

## STEP 2: Create Storage Buckets

1. **Go to Storage:**
   - Click: **Storage** (left sidebar)

2. **Create Bucket 1 - Product Images:**
   - Click: **Create new bucket**
   - **Name:** `product-images`
   - **Public:** Toggle ON (✅)
   - Click: **Create bucket**

3. **Create Bucket 2 - Payment Slips:**
   - Click: **Create new bucket**
   - **Name:** `payment-slips`
   - **Public:** Toggle OFF (❌)
   - Click: **Create bucket**

---

## STEP 3: Upload Nail Images

1. **Go to product-images bucket:**
   - Storage → **product-images**

2. **Upload Files:**
   - Click: **Upload a folder** (or drag & drop)
   - Navigate to your project folder:
     ```
     C:\Users\v.hemachandra\.copilot\repos\copilot-worktrees\SnailsbySenara\vihanganadeesha-redesigned-carnival\public\nails\
     ```
   - Select ALL 21 PNG files:
     - nail-01.png
     - nail-02.png
     - ... 
     - nail-21.png
   - Click: **Upload**
   - ✅ Wait for upload to complete

3. **Verify:**
   - You should see all 21 files in the bucket

---

## STEP 4: Insert Product Data

1. **SQL Editor → New Query**

2. **Copy this SQL:**

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
```

3. **Paste into SQL Editor**
4. **Click: RUN**
5. ✅ You should see "21 rows inserted"

---

## STEP 5: Link Product Images

1. **SQL Editor → New Query**

2. **Copy this SQL:**

```sql
-- Link product images
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

3. **Click: RUN**
4. ✅ You should see "21 rows inserted"

---

## STEP 6: Get Your API Keys

1. **Settings:**
   - Click: **Settings** (bottom left sidebar)
   - Click: **API**

2. **Copy These Values:**
   - **Project URL:** `https://tcjwvnxshhwsmibdwcoh.supabase.co` ✓
   - **anon (public) key:** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key:** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## STEP 7: Update Environment Variables

**Edit `.env.local` in your project:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://tcjwvnxshhwsmibdwcoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

**Replace:**
- `paste-your-anon-key-here` → Actual anon key
- `paste-your-service-role-key-here` → Actual service role key

**Save the file.**

---

## STEP 8: Restart Your App

**Terminal:**
```bash
npm run dev
```

**Wait for:**
```
> Ready on http://localhost:3000
```

---

## STEP 9: Test Everything

**Open:** http://localhost:3000/#shop

**You should see:**
- ✅ All 21 products loaded from database
- ✅ Product images displaying
- ✅ Prices and descriptions visible
- ✅ Add to cart working
- ✅ Size selection working

---

## ✅ Verification Checklist

In Supabase, verify:
- [ ] Tables → products (should show 21 rows)
- [ ] Tables → product_images (should show 21 rows)
- [ ] Tables → business_settings (should show 1 row)
- [ ] Storage → product-images (should have 21 files)
- [ ] Storage → payment-slips (should be empty, ready for uploads)

---

## 🎯 Done!

Your app is now **production-ready** with:
- ✅ Cloud database (Supabase)
- ✅ Cloud storage for images
- ✅ Order management system ready
- ✅ Payment tracking ready
- ✅ Customer data storage ready

**Next steps (optional):**
1. Add Stripe payment integration
2. Create admin dashboard
3. Set up email notifications
4. Enable order tracking

---

**Questions? Check SUPABASE_SETUP.md for detailed troubleshooting!**
