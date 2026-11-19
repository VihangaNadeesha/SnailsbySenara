# 🛒 Complete Checkout & Payment Flow Guide

## Overview

Your app has a **complete end-to-end checkout flow** where:
1. ✅ Customers add products to cart
2. ✅ They proceed to checkout
3. ✅ Fill in delivery details
4. ✅ Upload bank payment slip
5. ✅ Order details are saved to database
6. ✅ Payment confirmation is sent via WhatsApp

---

## 📊 Database Flow

### **1. ORDERS Table** (`orders`)
When customer submits checkout:
- **customer_name** - Customer's full name
- **customer_phone** - Contact phone number
- **delivery_address** - Full delivery address
- **additional_notes** - Special instructions
- **subtotal** - Total before delivery fee
- **delivery_fee** - Delivery charge
- **total** - Subtotal + delivery fee
- **status** - Order status (PENDING_APPROVAL_1 → PENDING_APPROVAL_2 → APPROVED)
- **order_number** - Auto-generated unique order ID
- **created_at** - Timestamp when order created

### **2. ORDER_ITEMS Table** (`order_items`)
One row per product in the order:
- **order_id** - Links to orders table
- **product_id** - Links to products table
- **product_name** - Name of product (snapshot)
- **selected_size** - Size chosen (XS, S, M, L)
- **quantity** - How many sets ordered
- **unit_price** - Price per set
- **line_total** - unit_price × quantity

### **3. PAYMENT_SLIPS Table** (`payment_slips`)
Bank slip file reference:
- **order_id** - Links to orders table
- **storage_path** - Path to file in Supabase Storage
- **uploaded_at** - When slip was uploaded

---

## 🔄 Checkout Process Flow

```
CUSTOMER → Adds products to cart
           ↓
       Clicks "Checkout"
           ↓
       Fills form:
       - Full Name ✓
       - Phone Number ✓
       - Delivery Address ✓
       - Additional Notes (optional)
           ↓
       Views Bank Details:
       - Bank Name
       - Account Holder
       - Account Number
       - Branch
           ↓
       Uploads Payment Slip (PNG/JPG/WEBP, <5MB) ✓
           ↓
       Clicks "Submit Order"
           ↓
    API RECEIVES REQUEST (/api/orders)
           ↓
    1. Validates all fields
    2. Checks file type/size
    3. Verifies product availability
    4. Creates ORDER record
    5. Uploads slip to Storage
    6. Creates ORDER_ITEMS records
    7. Creates PAYMENT_SLIPS record
           ↓
    API RETURNS order_number
           ↓
    Frontend opens WhatsApp with order summary
    Customer confirms via WhatsApp
           ↓
    Shows "Order Received" message
    Status: PENDING_APPROVAL_1
```

---

## 🔧 Key Components

### **Frontend (components/storefront.tsx)**
- `Checkout` component - Form for delivery & payment details
- Collects: name, phone, address, notes, payment slip
- Submits to `/api/orders` endpoint

### **Backend API (app/api/orders/route.ts)**
- POST endpoint that:
  1. Validates form data
  2. Validates payment slip (file type, size)
  3. Checks product availability
  4. Creates order in database
  5. Uploads slip to Supabase Storage
  6. Creates order items
  7. Records payment slip metadata

### **Database Tables**
- `orders` - Main order record
- `order_items` - Line items for each order
- `payment_slips` - Slip file references
- `products` - Product catalog (read-only in checkout)

---

## 📋 What Gets Saved

### **In ORDERS Table:**
```sql
INSERT INTO orders (
  customer_name,
  customer_phone,
  delivery_address,
  additional_notes,
  subtotal,
  delivery_fee,
  total,
  status
) VALUES (...)
```

### **In ORDER_ITEMS Table:**
```sql
INSERT INTO order_items (
  order_id,
  product_id,
  product_name,
  selected_size,
  quantity,
  unit_price,
  line_total
) VALUES (...)
```

### **In PAYMENT_SLIPS Table:**
```sql
INSERT INTO payment_slips (
  order_id,
  storage_path
) VALUES (...)
```

### **In Supabase Storage:**
- Folder: `payment_slips/`
- Structure: `{order_id}/payment-slip.{ext}`
- File types: JPG, PNG, WEBP
- Max size: 5 MB

---

## ✨ Order Status Workflow

```
PENDING_APPROVAL_1
   ↓ (Admin reviews order)
PENDING_APPROVAL_2
   ↓ (Admin reviews payment)
APPROVED / DECLINED
```

---

## 🎯 Current Status

✅ **Implemented:**
- Checkout form with all fields
- File upload validation
- Database schema with all tables
- API endpoint for order submission
- Product availability validation
- Bank details display
- WhatsApp notification
- Order confirmation screen

✅ **Testing:**
1. Add products to cart
2. Click "Proceed to Checkout"
3. Fill in all details
4. Upload a test payment slip image
5. Click "Submit Order"
6. Verify data appears in Supabase tables

---

## 🐛 Troubleshooting

### **"Upload failed"**
- File must be PNG, JPG, or WEBP
- File must be under 5 MB
- Check Supabase Storage bucket permissions

### **"Order failed"**
- Check product availability
- Verify all form fields are filled
- Check cart is not empty

### **Data not appearing in database**
- Check Supabase table permissions
- Verify service role key is set in .env.local
- Check API response in browser console

---

## 📱 Testing Checklist

- [ ] Add multiple products to cart
- [ ] Verify cart totals are correct
- [ ] Go to checkout page
- [ ] Fill all delivery details
- [ ] Upload a valid image as payment slip
- [ ] Click submit
- [ ] Check orders table - new record appears
- [ ] Check order_items table - product lines appear
- [ ] Check payment_slips table - slip record appears
- [ ] Check Supabase Storage - file exists
- [ ] Receive WhatsApp notification
- [ ] See "Order Received" confirmation

---

## 🚀 Next Steps

1. **Test the full flow** with a test order
2. **Admin Dashboard** - View pending orders
3. **Order Approval** - Implement approval workflow
4. **Email Notifications** - Add email confirmations
5. **Order Tracking** - Let customers track order status

