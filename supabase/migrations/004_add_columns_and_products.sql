-- Step 1: Add missing columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS hover_image TEXT;

-- Step 2: Insert all 21 Press-On Nail Products
INSERT INTO public.products (name, description, price, image, hover_image, category, in_stock) VALUES
-- Set 1-3: Classic Colors
('Classic French', 'Timeless French manicure press-on nails with elegant white tips', 1200, '/nails/nail_1.jpg', '/nails/nail_1_hover.jpg', 'classic', true),
('Glossy Red', 'Bold red press-on nails perfect for any occasion', 1200, '/nails/nail_2.jpg', '/nails/nail_2_hover.jpg', 'classic', true),
('Natural Nude', 'Nude-toned press-on nails for a natural everyday look', 1200, '/nails/nail_3.jpg', '/nails/nail_3_hover.jpg', 'classic', true),

-- Set 4-6: Pastel Shades
('Soft Pink', 'Delicate soft pink press-on nails ideal for minimalist style', 1300, '/nails/nail_4.jpg', '/nails/nail_4_hover.jpg', 'pastel', true),
('Baby Blue', 'Calming baby blue press-on nails with soothing aesthetic', 1300, '/nails/nail_5.jpg', '/nails/nail_5_hover.jpg', 'pastel', true),
('Lavender Dreams', 'Gorgeous lavender press-on nails for a dreamy look', 1300, '/nails/nail_6.jpg', '/nails/nail_6_hover.jpg', 'pastel', true),

-- Set 7-9: Metallic & Glitter
('Gold Shimmer', 'Luxurious gold shimmer press-on nails for special occasions', 1400, '/nails/nail_7.jpg', '/nails/nail_7_hover.jpg', 'glitter', true),
('Silver Sparkle', 'Dazzling silver sparkle press-on nails with mirror finish', 1400, '/nails/nail_8.jpg', '/nails/nail_8_hover.jpg', 'glitter', true),
('Rose Gold Glow', 'Elegant rose gold press-on nails with warm shimmer', 1400, '/nails/nail_9.jpg', '/nails/nail_9_hover.jpg', 'glitter', true),

-- Set 10-12: Trendy Designs
('Marble Bliss', 'Modern marble effect press-on nails with trendy aesthetic', 1350, '/nails/nail_10.jpg', '/nails/nail_10_hover.jpg', 'trendy', true),
('Geometric Pop', 'Fun geometric patterns press-on nails for bold statement', 1350, '/nails/nail_11.jpg', '/nails/nail_11_hover.jpg', 'trendy', true),
('Ombre Sunset', 'Beautiful ombre sunset gradient press-on nails', 1350, '/nails/nail_12.jpg', '/nails/nail_12_hover.jpg', 'trendy', true),

-- Set 13-15: Floral & Nature
('Floral Paradise', 'Delicate floral prints press-on nails with nature vibes', 1350, '/nails/nail_13.jpg', '/nails/nail_13_hover.jpg', 'floral', true),
('Garden Rose', 'Romantic rose garden press-on nails for elegant look', 1350, '/nails/nail_14.jpg', '/nails/nail_14_hover.jpg', 'floral', true),
('Spring Blossom', 'Fresh spring blossom press-on nails with pastel flowers', 1350, '/nails/nail_15.jpg', '/nails/nail_15_hover.jpg', 'floral', true),

-- Set 16-18: Bold & Vibrant
('Deep Plum', 'Rich deep plum press-on nails for sophisticated look', 1300, '/nails/nail_16.jpg', '/nails/nail_16_hover.jpg', 'bold', true),
('Electric Blue', 'Vibrant electric blue press-on nails for statement nails', 1300, '/nails/nail_17.jpg', '/nails/nail_17_hover.jpg', 'bold', true),
('Coral Crush', 'Lively coral press-on nails perfect for summer season', 1300, '/nails/nail_18.jpg', '/nails/nail_18_hover.jpg', 'bold', true),

-- Set 19-21: Premium Collections
('Diamond Luxe', 'Premium diamond-inspired luxury press-on nails', 1500, '/nails/nail_19.jpg', '/nails/nail_19_hover.jpg', 'premium', true),
('Pearl Elegance', 'Sophisticated pearl finish press-on nails with lustre', 1500, '/nails/nail_20.jpg', '/nails/nail_20_hover.jpg', 'premium', true),
('Velvet Touch', 'Luxurious velvet textured press-on nails for premium feel', 1500, '/nails/nail_21.jpg', '/nails/nail_21_hover.jpg', 'premium', true);

-- Step 3: Verify insertion
SELECT COUNT(*) as total_products, 
       MIN(price) as min_price,
       MAX(price) as max_price,
       COUNT(DISTINCT category) as categories
FROM public.products;
