# 🔄 Data Flow Diagram

## From Customer Checkout to Database

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER CHECKOUT                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ FORM INPUTS:                                                     │   │
│  │  • Full Name         → customer_name                             │   │
│  │  • Phone             → customer_phone                            │   │
│  │  • Address           → delivery_address                          │   │
│  │  • Notes (optional)  → additional_notes                          │   │
│  │  • Payment Slip      → FILE UPLOAD                               │   │
│  │  • Cart Items        → product IDs, sizes, quantities            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                        │
│                      POST /api/orders (FormData)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
        ┌────────────────────────────────────────────────────┐
        │          API VALIDATION & PROCESSING                │
        │  ✓ Validate form fields (name, phone, address)      │
        │  ✓ Validate file (type, size)                       │
        │  ✓ Parse cart items                                 │
        │  ✓ Check product availability in DB                 │
        │  ✓ Calculate totals (subtotal + delivery fee)        │
        └────────────────────────────────────────────────────┘
                                 ↓
        ╔════════════════════════╤════════════════════════════╗
        ║                        ↓                            ║
        ║          ┌──────────────────────┐                   ║
        ║          │  CREATE ORDER        │                   ║
        ║          ├──────────────────────┤                   ║
        ║          │ orders TABLE         │                   ║
        ║          │ ─────────────────    │                   ║
        ║          │ • order_id (UUID)    │                   ║
        ║          │ • order_number       │                   ║
        ║          │ • customer_name      │                   ║
        ║          │ • customer_phone     │                   ║
        ║          │ • delivery_address   │                   ║
        ║          │ • additional_notes   │                   ║
        ║          │ • subtotal           │                   ║
        ║          │ • delivery_fee       │                   ║
        ║          │ • total              │                   ║
        ║          │ • status             │                   ║
        ║          │ • created_at         │                   ║
        ║          └──────────────────────┘                   ║
        ║                   ↓                                 ║
        ║          ┌──────────────────────┐                   ║
        ║          │  UPLOAD SLIP FILE    │                   ║
        ║          ├──────────────────────┤                   ║
        ║          │ Supabase Storage:    │                   ║
        ║          │ payment_slips/       │                   ║
        ║          │ {order_id}/          │                   ║
        ║          │ payment-slip.{ext}   │                   ║
        ║          └──────────────────────┘                   ║
        ║                   ↓                                 ║
        ║          ┌──────────────────────┐                   ║
        ║          │  CREATE ORDER ITEMS  │                   ║
        ║          ├──────────────────────┤                   ║
        ║          │ order_items TABLE    │                   ║
        ║          │ ─────────────────    │                   ║
        ║          │ For each product:    │                   ║
        ║          │ • order_id (FK)      │                   ║
        ║          │ • product_id         │                   ║
        ║          │ • product_name       │                   ║
        ║          │ • selected_size      │                   ║
        ║          │ • quantity           │                   ║
        ║          │ • unit_price         │                   ║
        ║          │ • line_total         │                   ║
        ║          └──────────────────────┘                   ║
        ║                   ↓                                 ║
        ║          ┌──────────────────────┐                   ║
        ║          │  CREATE SLIP RECORD  │                   ║
        ║          ├──────────────────────┤                   ║
        ║          │ payment_slips TABLE  │                   ║
        ║          │ ─────────────────    │                   ║
        ║          │ • order_id (FK)      │                   ║
        ║          │ • storage_path       │                   ║
        ║          │ • uploaded_at        │                   ║
        ║          └──────────────────────┘                   ║
        ╚════════════════════════╤════════════════════════════╝
                                 ↓
                    ┌────────────────────────┐
                    │  RETURN order_number   │
                    │  to Frontend           │
                    └────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │  SEND WHATSAPP MSG     │
                    │  with order summary    │
                    └────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │  SHOW SUCCESS SCREEN   │
                    │  "Order Received"      │
                    │  Order #XXXXX          │
                    │  Status: Pending       │
                    │  Approval              │
                    └────────────────────────┘
```

---

## Database Relationships

```
┌──────────────┐
│   ORDERS     │  ◄─────────┐
├──────────────┤            │
│ id (PK)      │            │ FOREIGN KEY
│ order_number │            │
│ ...          │            │
└──────────────┘            │
     ▲                       │
     │ 1                 Many│
     │ ───────────────────── 
     │
┌────────────────┐    ┌──────────────────┐
│  ORDER_ITEMS   │    │  PAYMENT_SLIPS   │
├────────────────┤    ├──────────────────┤
│ order_id (FK)  ├────┤ order_id (FK)    │
│ product_id (FK)│    │ storage_path     │
│ quantity       │    │ uploaded_at      │
│ unit_price     │    └──────────────────┘
│ line_total     │
└────────────────┘
     ▲
     │ FOREIGN KEY
     │
  ┌──────────────┐
  │   PRODUCTS   │
  ├──────────────┤
  │ id (PK)      │
  │ name         │
  │ price        │
  │ image        │
  │ ...          │
  └──────────────┘
```

---

## Status Workflow

```
Customer submits order
         ↓
   PENDING_APPROVAL_1
   (Admin reviews order details)
         ↓
   PENDING_APPROVAL_2
   (Admin verifies payment slip)
         ↓
      ┌──┴──┐
      ↓     ↓
   APPROVED  DECLINED
      ✓       ✗
```

