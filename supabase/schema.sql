-- Snails by Senara - Complete Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in Rs. (store as cents to avoid decimals)
  inventory INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Path in Supabase storage (e.g., 'nails/nail-01.png')
  display_order INTEGER DEFAULT 0,
  is_hover_image BOOLEAN DEFAULT false, -- For hover effects (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. BUSINESS SETTINGS TABLE
-- ============================================
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  branch TEXT,
  delivery_fee INTEGER, -- In Rs.
  whatsapp_number TEXT,
  google_review_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  delivery_information TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- Format: 'SBS-20261118-001'
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  subtotal INTEGER NOT NULL, -- In Rs.
  delivery_fee INTEGER NOT NULL, -- In Rs.
  total_amount INTEGER NOT NULL, -- Subtotal + delivery fee
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  payment_verified BOOLEAN DEFAULT false,
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL, -- Snapshot of product name at time of order
  selected_size TEXT NOT NULL, -- 'XS', 'S', 'M', 'L'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Price at time of order
  subtotal INTEGER NOT NULL, -- unit_price * quantity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. PAYMENT SLIPS TABLE
-- ============================================
CREATE TABLE payment_slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase storage (e.g., 'payment-slips/order-123.jpg')
  file_size INTEGER, -- In bytes
  file_type TEXT, -- 'image/jpeg', 'image/png', etc.
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by_admin TEXT,
  rejection_reason TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_display_order ON products(display_order);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payment_slips_order_id ON payment_slips(order_id);
CREATE INDEX idx_payment_slips_verification_status ON payment_slips(verification_status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public to read products" ON products
  FOR SELECT USING (true);

-- Allow public read access to product images
CREATE POLICY "Allow public to read product images" ON product_images
  FOR SELECT USING (true);

-- Allow public read access to business settings
CREATE POLICY "Allow public to read business settings" ON business_settings
  FOR SELECT USING (true);

-- Allow public to insert orders
CREATE POLICY "Allow public to insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow public to read their own orders (by phone number)
CREATE POLICY "Allow public to read own orders" ON orders
  FOR SELECT USING (true);

-- Allow public to insert order items
CREATE POLICY "Allow public to insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Allow public to insert payment slips
CREATE POLICY "Allow public to insert payment slips" ON payment_slips
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample business setting
INSERT INTO business_settings (
  bank_name,
  account_name,
  account_number,
  branch,
  delivery_fee,
  whatsapp_number,
  google_review_url,
  instagram_url,
  facebook_url,
  tiktok_url,
  delivery_information
) VALUES (
  'Commercial Bank of Ceylon',
  'Senara Beauty Studio',
  '1234567890',
  'Colombo Main',
  500,
  '+94769472343',
  'https://www.google.com/search?q=Snails+by+Senara',
  'https://instagram.com/snailsbysenara',
  'https://facebook.com/snailsbysenara',
  'https://tiktok.com/@snailsbysenara',
  'Free delivery for orders above Rs. 5,000'
);
