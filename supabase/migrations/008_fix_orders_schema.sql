-- Fix orders table schema to match API expectations
-- Drop existing columns that don't match and add missing ones

ALTER TABLE public.orders
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS total_amount,
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS payment_status;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- Remove defaults from new columns to allow proper insertion
ALTER TABLE public.orders
ALTER COLUMN customer_name DROP DEFAULT,
ALTER COLUMN customer_phone DROP DEFAULT,
ALTER COLUMN delivery_address DROP DEFAULT,
ALTER COLUMN subtotal DROP DEFAULT,
ALTER COLUMN delivery_fee DROP DEFAULT,
ALTER COLUMN total DROP DEFAULT;

-- Ensure status has correct values
ALTER TABLE public.orders
ALTER COLUMN status SET DEFAULT 'PENDING_APPROVAL_1';

-- Generate order_number if missing
UPDATE public.orders 
SET order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || gen_random_uuid()::text
WHERE order_number IS NULL;

-- Make order_number NOT NULL
ALTER TABLE public.orders
ALTER COLUMN order_number SET NOT NULL;

-- Create order_items table if it doesn't have correct columns
-- Check if the table needs updating
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS selected_size VARCHAR(5),
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS line_total DECIMAL(10, 2);

-- Create business_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(255) DEFAULT 'Sample Bank',
  account_name VARCHAR(255) DEFAULT 'Senara Nails',
  account_number VARCHAR(50) DEFAULT '1234567890',
  branch VARCHAR(255) DEFAULT 'Main Branch',
  whatsapp_number VARCHAR(20) DEFAULT '+94123456789',
  delivery_fee DECIMAL(10, 2) DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default business settings if the table is empty
INSERT INTO public.business_settings (bank_name, account_name, account_number, branch, whatsapp_number, delivery_fee)
SELECT 'Sample Bank', 'Senara Nails', '1234567890', 'Main Branch', '+94123456789', 500
WHERE NOT EXISTS (SELECT 1 FROM public.business_settings);

-- Create payment_slips table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  storage_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
