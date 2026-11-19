# ✅ SUPABASE SETUP TODO LIST

## Project Info
- **Project Name:** VihangaNadeesha's Project
- **Project URL:** https://tcjwvnxshhwsmibdwcoh.supabase.co
- **Status:** ✅ Created & Healthy

---

## 📋 Setup Checklist

### Phase 1: Database Setup
- [ ] **1.1** Open Supabase SQL Editor
- [ ] **1.2** Copy contents from `supabase/schema.sql`
- [ ] **1.3** Paste into SQL Editor and RUN
- [ ] **1.4** ✅ Verify: Tables created (products, orders, payment_slips, etc.)

### Phase 2: Storage Setup
- [ ] **2.1** Go to Storage in Supabase
- [ ] **2.2** Create bucket: `product-images` (PUBLIC ✅)
- [ ] **2.3** Create bucket: `payment-slips` (PRIVATE ❌)

### Phase 3: Upload Images
- [ ] **3.1** Open Storage → `product-images`
- [ ] **3.2** Upload folder: `/public/nails/` (all 21 PNG files)
- [ ] **3.3** ✅ Verify: All 21 images uploaded

### Phase 4: Insert Product Data
- [ ] **4.1** SQL Editor → New Query
- [ ] **4.2** Copy INSERT products SQL from `MANUAL_SETUP_STEPS.md` (Step 4)
- [ ] **4.3** Run query
- [ ] **4.4** ✅ Verify: "21 rows inserted"

### Phase 5: Link Images to Products
- [ ] **5.1** SQL Editor → New Query
- [ ] **5.2** Copy INSERT product_images SQL from `MANUAL_SETUP_STEPS.md` (Step 5)
- [ ] **5.3** Run query
- [ ] **5.4** ✅ Verify: "21 rows inserted"

### Phase 6: Get API Keys
- [ ] **6.1** Settings → API
- [ ] **6.2** Copy: Project URL ✓ (already have)
- [ ] **6.3** Copy: Anon public key
- [ ] **6.4** Copy: Service role key
- [ ] **6.5** Save keys securely

### Phase 7: Configure App
- [ ] **7.1** Edit `.env.local`
- [ ] **7.2** Update `NEXT_PUBLIC_SUPABASE_URL`
- [ ] **7.3** Update `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **7.4** Update `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **7.5** Save file

### Phase 8: Test
- [ ] **8.1** Terminal: `npm run dev`
- [ ] **8.2** Open: http://localhost:3000/#shop
- [ ] **8.3** ✅ See all 21 products
- [ ] **8.4** ✅ Images loading
- [ ] **8.5** ✅ Add to cart works
- [ ] **8.6** ✅ Checkout process works

---

## 📊 Verification Checklist

After setup, verify in Supabase:

### Database Tables
- [ ] `products` table has 21 rows
- [ ] `product_images` table has 21 rows
- [ ] `business_settings` table has 1 row
- [ ] `orders` table exists (empty, ready for use)
- [ ] `order_items` table exists (empty, ready for use)
- [ ] `payment_slips` table exists (empty, ready for use)

### Storage Buckets
- [ ] `product-images` bucket exists (PUBLIC)
- [ ] `product-images` contains 21 PNG files
- [ ] `payment-slips` bucket exists (PRIVATE)

### App Functionality
- [ ] Products load from database (not demo data)
- [ ] Images display from cloud storage
- [ ] All 21 products visible in 4-column grid
- [ ] Add to cart functionality works
- [ ] Size selection works
- [ ] Quantity selector works
- [ ] Checkout starts successfully

---

## 📂 Reference Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Complete database schema (copy to SQL Editor) |
| `MANUAL_SETUP_STEPS.md` | Detailed step-by-step guide |
| `SUPABASE_SETUP.md` | Comprehensive setup documentation |
| `SUPABASE_QUICKSTART.txt` | Quick reference checklist |
| `TODO_SUPABASE.md` | This file - tracking list |
| `.env.local` | Environment variables (UPDATE WITH YOUR KEYS) |

---

## 🔑 Key Information

**Project URL:**
```
https://tcjwvnxshhwsmibdwcoh.supabase.co
```

**Your API Keys** (from Settings → API):
```
NEXT_PUBLIC_SUPABASE_URL=https://tcjwvnxshhwsmibdwcoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[COPY FROM SUPABASE DASHBOARD]
SUPABASE_SERVICE_ROLE_KEY=[COPY FROM SUPABASE DASHBOARD]
```

---

## 🚨 Important Notes

⚠️ **Keep keys safe!**
- Never commit `.env.local` to git
- Never share service_role_key publicly
- Anon key is public (safe to expose in frontend)

✅ **Follow the order!**
- Do Phase 1 (database) BEFORE Phase 2 (storage)
- Do Phase 3 (upload images) BEFORE Phase 4 (insert products)
- Do all setup BEFORE testing in app

🔄 **If something goes wrong:**
- Check `SUPABASE_SETUP.md` troubleshooting section
- Verify each step is complete before moving to next
- Don't skip steps!

---

## 📞 Support

Having issues?
1. Check `MANUAL_SETUP_STEPS.md` - Detailed instructions
2. Check `SUPABASE_SETUP.md` - Troubleshooting section
3. Verify all keys and URLs are correct
4. Try restarting: `npm run dev`

---

**Start with MANUAL_SETUP_STEPS.md and follow each step carefully! 🚀**
