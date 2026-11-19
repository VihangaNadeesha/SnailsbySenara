# 🎀 Add 21 Press-On Nail Products - Complete Guide

## ✅ SQL File Ready!

A complete SQL INSERT statement has been created with all 21 products:
📁 **File:** `supabase/migrations/003_insert_products.sql`

---

## 🚀 How to Add Products - 2 Methods

### **METHOD 1: Copy-Paste SQL (Fastest - 2 minutes)**

#### Step 1️⃣: Open the SQL File
In VS Code, open: `supabase/migrations/003_insert_products.sql`

#### Step 2️⃣: Copy All Content
```
Ctrl+A (or Cmd+A on Mac)
Ctrl+C (or Cmd+C)
```

#### Step 3️⃣: Go to Supabase SQL Editor
Navigate to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql/new

#### Step 4️⃣: Paste & Run
```
1. Click in the SQL editor
2. Ctrl+V (paste the SQL)
3. Click GREEN "Run" button
4. Wait for "Success" message
```

#### Step 5️⃣: Verify Products
Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/editor/products

You should see 21 products listed!

---

### **METHOD 2: Use Database Insert UI (Alternative)**

If you prefer using Supabase UI:

1. Go to Table Editor: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/editor/products
2. Click **"Insert"** button
3. Add each product manually (takes longer but more interactive)

---

## 📊 Products Being Added

The SQL file adds these 21 products in 7 categories:

### **Classic Collection (3 items)** - Rs. 1,200 each
1. Classic French - Timeless French manicure
2. Glossy Red - Bold red nails
3. Natural Nude - Nude-toned everyday look

### **Pastel Collection (3 items)** - Rs. 1,300 each
4. Soft Pink - Delicate minimalist style
5. Baby Blue - Calming aesthetic
6. Lavender Dreams - Dreamy vibe

### **Metallic & Glitter (3 items)** - Rs. 1,400 each
7. Gold Shimmer - Luxurious special occasions
8. Silver Sparkle - Mirror finish sparkle
9. Rose Gold Glow - Warm shimmer

### **Trendy Designs (3 items)** - Rs. 1,350 each
10. Marble Bliss - Modern marble effect
11. Geometric Pop - Bold geometric patterns
12. Ombre Sunset - Beautiful gradient

### **Floral & Nature (3 items)** - Rs. 1,350 each
13. Floral Paradise - Delicate floral prints
14. Garden Rose - Romantic roses
15. Spring Blossom - Fresh spring flowers

### **Bold & Vibrant (3 items)** - Rs. 1,300 each
16. Deep Plum - Sophisticated rich plum
17. Electric Blue - Vibrant statement nails
18. Coral Crush - Lively summer coral

### **Premium Collection (3 items)** - Rs. 1,500 each
19. Diamond Luxe - Premium luxury nails
20. Pearl Elegance - Sophisticated pearls
21. Velvet Touch - Luxurious velvet texture

---

## 📁 Product Image Paths

Each product references images at:
- **Main image:** `/nails/nail_1.jpg`, `/nails/nail_2.jpg`, etc.
- **Hover image:** `/nails/nail_1_hover.jpg`, `/nails/nail_2_hover.jpg`, etc.

These paths point to your public folder. You'll need to:
1. Create `/public/nails/` folder (if not exists)
2. Add actual image files OR
3. Update image paths to your image URLs

---

## 🖼️ Next: Add Actual Images

After running the SQL, you have two options:

### **Option A: Use Placeholder Images (Quick)**
Leave the current image paths - they'll show placeholders

### **Option B: Add Real Images (Recommended)**
1. Create folder: `/public/nails/`
2. Add 21 images named: `nail_1.jpg` through `nail_21.jpg`
3. Add 21 hover images: `nail_1_hover.jpg` through `nail_21_hover.jpg`
4. OR update SQL with actual image URLs

---

## ✅ What to Do Next

1. **Now:** Run the SQL INSERT to add products to database
2. **Then:** Refresh your app - products should appear!
3. **After:** Add actual images to `/public/nails/` folder
4. **Finally:** Update product grid to show 4 columns with hover effects

---

## 🔧 Database Schema for Products

The products table has these columns:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price INT,
  image VARCHAR(255),
  hover_image VARCHAR(255),
  category VARCHAR(100),
  in_stock BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 💾 SQL File Location

```
📂 Project Root
  └── 📂 supabase
      └── 📂 migrations
          └── 📄 003_insert_products.sql  ← USE THIS FILE!
```

---

## 🚨 Important Notes

✅ **All 21 products** with names, descriptions, prices
✅ **7 categories** for filtering/sorting
✅ **In stock** set to true for all products
✅ **Price range** Rs. 1,200 - Rs. 1,500
✅ **Image paths** ready to be updated

---

## 🎯 Ready to Go!

Just copy-paste the SQL and run it - your products will be in the database! 🎉

**Next:** Refresh your app at http://localhost:3002 and you should see products appearing!
