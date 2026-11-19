# 🧪 Testing the Complete Checkout Flow

## Step-by-Step Testing Guide

### **1. Start the App**
```bash
npm run dev
# App runs at http://localhost:3002
```

---

### **2. Add Products to Cart**
1. ✅ Go to **Shop** section (or scroll down)
2. ✅ See all 21 nail products with images
3. ✅ Click on any product
4. ✅ Select a size (XS, S, M, L)
5. ✅ Set quantity (1-10)
6. ✅ Click **"Add to Cart"**
7. ✅ Repeat for 2-3 different products

---

### **3. Open Cart**
1. ✅ Click **Cart icon** (top right)
2. ✅ Verify all selected products appear
3. ✅ Check quantities and sizes are correct
4. ✅ Verify price calculations:
   - Subtotal = sum of (price × quantity)
   - Delivery Fee = Rs. XXXX (from settings)
   - Total = Subtotal + Delivery Fee
5. ✅ Click **"Proceed to Checkout"**

---

### **4. Fill Checkout Form**

**Delivery Details Section:**
```
Full Name:          "Tharushi Maduwanthi"
Phone Number:       "+94721234567"
Delivery Address:   "123 Main Street, Colombo, Sri Lanka 00100"
Additional Notes:   "Please ring the doorbell twice"
```

**Payment Details Section:**
(Should show automatically from your business settings)
```
Bank:              "Example Bank"
Account Name:      "Snails by Senara"
Account Number:    "1234567890"
Branch:            "Colombo Main Branch"
```

---

### **5. Upload Payment Slip**
1. ✅ Prepare a test image file:
   - Format: PNG, JPG, or WEBP
   - Size: Less than 5 MB
   - Can be any image (screenshot, real slip, etc.)
   
2. ✅ Click **"Choose File"** button
3. ✅ Select your test image
4. ✅ Verify filename appears

---

### **6. Submit Order**
1. ✅ Verify all fields are filled (red asterisks show required)
2. ✅ Click **"Submit Order"** button
3. ✅ Wait for processing (5-10 seconds)

---

### **7. Verify Success**
You should see:
- ✅ "Order Received" success screen
- ✅ Order number (e.g., "Order #5432")
- ✅ Message: "Order Submitted"
- ✅ Status: "Pending Approval"

---

### **8. Verify Database**

Go to **Supabase Dashboard** → **Table Editor**

#### **Check ORDERS table:**
```
Expected columns:
├── id (UUID) ← Order ID
├── order_number (Integer) ← Order #
├── customer_name ← "Tharushi Maduwanthi"
├── customer_phone ← "+94721234567"
├── delivery_address ← "123 Main Street..."
├── additional_notes ← "Please ring doorbell..."
├── subtotal ← 3600 (example)
├── delivery_fee ← 500
├── total ← 4100
├── status ← "PENDING_APPROVAL_1"
├── created_at ← Current timestamp
└── updated_at ← Current timestamp
```

#### **Check ORDER_ITEMS table:**
```
Expected rows (one per product):
├── order_id ← Links to ORDERS table
├── product_id ← Links to PRODUCTS table
├── product_name ← "Classic French"
├── selected_size ← "M" (or selected size)
├── quantity ← 2 (or selected qty)
├── unit_price ← 1200 (product price)
├── line_total ← 2400 (unit_price × qty)
└── created_at ← Current timestamp
```

#### **Check PAYMENT_SLIPS table:**
```
Expected record:
├── id (UUID) ← Slip record ID
├── order_id ← Links to ORDERS table
├── storage_path ← "/payment_slips/{order_id}/payment-slip.png"
└── uploaded_at ← Current timestamp
```

---

### **9. Verify File Storage**

Go to **Supabase Dashboard** → **Storage**

Look for **payment_slips** bucket:
```
payment_slips/
├── {order_id}/
│   └── payment-slip.png  ← Your uploaded file
└── {another_order_id}/
    └── payment-slip.jpg
```

---

## ✅ What Gets Saved Where

| Data | Table | Column | Value |
|------|-------|--------|-------|
| Customer Name | orders | customer_name | "Tharushi Maduwanthi" |
| Phone | orders | customer_phone | "+94721234567" |
| Address | orders | delivery_address | "123 Main Street..." |
| Notes | orders | additional_notes | "Please ring doorbell..." |
| Subtotal | orders | subtotal | 3600 |
| Delivery Fee | orders | delivery_fee | 500 |
| Total | orders | total | 4100 |
| Order Status | orders | status | "PENDING_APPROVAL_1" |
| Product 1 | order_items | product_name | "Classic French" |
| Size 1 | order_items | selected_size | "M" |
| Quantity 1 | order_items | quantity | 2 |
| Price 1 | order_items | unit_price | 1200 |
| Payment Slip | payment_slips | storage_path | "/payment_slips/{uuid}/..." |

---

## 🐛 Troubleshooting

### **Issue: "Submit Order" button doesn't work**
**Solution:**
- Check browser console (F12) for error messages
- Ensure all form fields are filled
- Ensure file is selected and valid format

### **Issue: "We couldn't submit your order" error**
**Solution:**
- Check if Supabase is connected (`.env.local` has correct keys)
- Check API response in browser console
- Verify payment slip file is <5MB and right format

### **Issue: Data not in Supabase**
**Solution:**
- Refresh Supabase table editor (F5)
- Check if correct project is selected (tcjwvnxshhwsmibdwcoh)
- Check table row count increased

### **Issue: File upload failed**
**Solution:**
- File must be PNG, JPG, or WEBP
- File must be <5 MB
- Check Supabase Storage bucket exists

### **Issue: WhatsApp doesn't open**
**Solution:**
- WhatsApp is optional (order still saves)
- If needed, check WhatsApp number in business settings
- Try opening WhatsApp manually and check message

---

## 🎯 Test Scenarios

### **Test 1: Single Product Order**
- Add 1 product, 1 qty
- Verify order total = price + delivery_fee

### **Test 2: Multiple Products**
- Add 3 different products with different sizes
- Verify subtotal = sum of all line totals
- Check order_items has 3 rows

### **Test 3: Multiple Quantities**
- Add 1 product with qty=5
- Verify line_total = price × 5
- Check order_items quantity = 5

### **Test 4: Form Validation**
- Try submitting with empty fields
- Should show validation error
- Try uploading wrong file type (PDF, TXT)
- Should show file type error

### **Test 5: Edge Cases**
- Very long address (>500 chars)
- Phone with special characters
- File exactly 5 MB size
- Order #XXXXX should be unique

---

## 📊 Expected Results

After 5 successful test orders, Supabase should show:

```
ORDERS: 5 rows
ORDER_ITEMS: 5-15 rows (depending on products per order)
PAYMENT_SLIPS: 5 rows
PRODUCTS: 21 rows (unchanged)
```

---

## 🚀 Next: Admin Dashboard

Once checkout is working, we can build:
- ✅ Admin login
- ✅ View pending orders
- ✅ Approve/Decline orders
- ✅ Update order status
- ✅ Track payments
- ✅ Generate reports

