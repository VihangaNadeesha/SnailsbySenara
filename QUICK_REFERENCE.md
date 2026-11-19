# 📋 SUPABASE SETUP REFERENCE CARD

## Your Project
```
Name:    VihangaNadeesha's Project
URL:     https://tcjwvnxshhwsmibdwcoh.supabase.co
Status:  ✅ Healthy & Ready
Region:  Configured
```

---

## 📚 Documentation Guide

| Need | Read This File |
|------|---|
| **Quick start** | NEXT_STEPS.md |
| **Step-by-step walkthrough** | MANUAL_SETUP_STEPS.md |
| **Checklist tracker** | TODO_SUPABASE.md |
| **Visual diagrams** | SETUP_VISUAL_GUIDE.txt |
| **SQL to run** | supabase/schema.sql |
| **Full guide + troubleshooting** | SUPABASE_SETUP.md |
| **Quick reference** | SUPABASE_QUICKSTART.txt |

---

## ⚡ 9-Step Quick Summary

```
1. SQL Editor → Run schema.sql (create tables)
2. Storage → Create 2 buckets
3. Upload → 21 PNG files to product-images
4. SQL Editor → Insert 21 products
5. SQL Editor → Link images to products
6. Settings → Copy API keys (3 values)
7. .env.local → Add the 3 API keys
8. Terminal → npm run dev (restart)
9. Test → http://localhost:3000/#shop (verify)
```

**Time needed: ~20 minutes**

---

## 🔑 API Credentials Location

**When You Get To Step 6:**

Go to: Supabase Dashboard → Settings → API

Copy these 3 values:
1. **Project URL** (already have ✓)
2. **anon (public) key** ← Copy this
3. **service_role key** ← Copy this

Then paste into `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tcjwvnxshhwsmibdwcoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-here
SUPABASE_SERVICE_ROLE_KEY=paste-here
```

---

## ✅ Success Indicators

**When complete, you'll have:**

✓ 21 products in database  
✓ 21 images in cloud storage  
✓ Order management system ready  
✓ Payment tracking ready  
✓ All 21 products showing on website  
✓ Add to cart working  
✓ Checkout process live  

---

## 🆘 Stuck?

**Step 1-2:** Check MANUAL_SETUP_STEPS.md Step 1 & 2  
**Step 3:** Verify images uploaded to storage bucket  
**Step 4-5:** Check SQL query ran without errors  
**Step 6:** Settings → API (copy full keys, not partial)  
**Step 7:** Save .env.local, don't forget!  
**Step 8:** npm run dev must complete with no errors  
**Step 9:** If products don't show, check browser console for errors  

---

## 📱 Testing URLs

After setup (Step 9):
- **Shop:** http://localhost:3000/#shop
- **Home:** http://localhost:3000/
- **About:** http://localhost:3000/#about

---

## 🚀 You're Ready!

**Everything is prepared and waiting for you!**

Just follow MANUAL_SETUP_STEPS.md from start to finish.

Questions? Check SUPABASE_SETUP.md for detailed help.

---

**Start now! 🎉**
