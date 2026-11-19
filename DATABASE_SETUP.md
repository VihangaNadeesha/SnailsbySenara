# Database Setup Guide - Snails by Senara

## Quick Start - Execute SQL in Supabase Console

The database schema is split into separate SQL files for easy manual execution.

### Method 1: Using Supabase SQL Editor (Recommended for First-Time Setup)

1. **Go to Supabase SQL Editor:**
   - Navigate to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql/new

2. **Execute SQL Statements:**
   - Copy and paste each SQL statement below into the editor
   - Click "Run" button
   - Verify "Success" message appears

### SQL Statements to Execute:

#### 1. Create Users Table
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Create Products Table
```sql
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Create Orders Table
```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Create Order Items Table
```sql
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Create Bank Payments Table
```sql
CREATE TABLE IF NOT EXISTS public.bank_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  bank_name VARCHAR(255) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20),
  upi_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Create Cart Table
```sql
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

#### 7. Create Addresses Table
```sql
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. Create Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bank_payments_order_id ON public.bank_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
```

### Method 2: Verify Tables Were Created

1. **Go to Table Editor:**
   - Navigate to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/editor

2. **Check for these tables:**
   - users
   - products
   - orders
   - order_items
   - bank_payments
   - cart
   - addresses

## Database Schema Overview

### users
- Stores customer account information
- Primary fields: id, email, full_name, phone
- Timestamps: created_at, updated_at

### products
- Stores press-on nail product details
- Primary fields: id, name, price, image_url, category, stock_quantity
- Timestamps: created_at, updated_at

### orders
- Stores customer orders
- Primary fields: id, user_id, order_number, total_amount, status, payment_method, payment_status
- Timestamps: created_at, updated_at

### order_items
- Stores individual items in each order (line items)
- Primary fields: id, order_id, product_id, quantity, price
- Timestamps: created_at

### bank_payments
- Stores bank payment transaction details
- Primary fields: id, order_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, payment_status
- Timestamps: created_at, updated_at, paid_at

### cart
- Stores shopping cart items for users
- Primary fields: id, user_id, product_id, quantity
- Timestamps: created_at, updated_at

### addresses
- Stores customer shipping addresses
- Primary fields: id, user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default
- Timestamps: created_at, updated_at

## Payment Method Details

The system uses **bank transfer payment method** with the following fields:
- `bank_name` - Name of the bank
- `account_holder_name` - Account holder name
- `account_number` - Bank account number
- `ifsc_code` - IFSC code for bank identification
- `upi_id` - Alternative UPI ID for payment
- `payment_status` - Track payment status (pending, paid, failed, cancelled)
- `paid_at` - Timestamp when payment was received
- `receipt_url` - URL to payment receipt/proof
- `notes` - Additional payment notes

## Next Steps

1. ✅ Execute all SQL statements in Supabase SQL Editor
2. ✅ Verify tables appear in Table Editor
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Navigate to `http://localhost:3000` to see the application

## Troubleshooting

### "Table already exists" error
- This is normal - it means the table was already created in a previous run
- The SQL uses `IF NOT EXISTS` to handle this gracefully

### "Foreign key constraint" error
- Ensure tables are created in the correct order:
  1. users (no dependencies)
  2. products (no dependencies)
  3. orders (references users)
  4. order_items (references orders and products)
  5. bank_payments (references orders)
  6. cart (references users and products)
  7. addresses (references users)

### Cannot connect to Supabase
- Verify `.env.local` has correct credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Migration File Location

The complete SQL migration file is located at:
```
supabase/migrations/001_create_initial_schema.sql
```

This file can be used for version control and future deployments.
