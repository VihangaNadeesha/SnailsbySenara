-- Step 1: Add ALL missing columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS hover_image TEXT,
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Step 2: Insert all 21 Press-On Nail Products
INSERT INTO public.products (name, description, price, image, hover_image, category, in_stock) VALUES
-- Set 1-3: Classic Colors
('Classic French', 'Timeless French manicure press-on nails with elegant white tips', 1200, '/nails/nail-01.png', '/nails/nail-01.png', 'classic', true),
('Glossy Red', 'Bold red press-on nails perfect for any occasion', 1200, '/nails/nail-02.png', '/nails/nail-02.png', 'classic', true),
('Natural Nude', 'Nude-toned press-on nails for a natural everyday look', 1200, '/nails/nail-03.png', '/nails/nail-03.png', 'classic', true),

-- Set 4-6: Pastel Shades
('Soft Pink', 'Delicate soft pink press-on nails ideal for minimalist style', 1300, '/nails/nail-04.png', '/nails/nail-04.png', 'pastel', true),
('Baby Blue', 'Calming baby blue press-on nails with soothing aesthetic', 1300, '/nails/nail-05.png', '/nails/nail-05.png', 'pastel', true),
('Lavender Dreams', 'Gorgeous lavender press-on nails for a dreamy look', 1300, '/nails/nail-06.png', '/nails/nail-06.png', 'pastel', true),

-- Set 7-9: Metallic & Glitter
('Gold Shimmer', 'Luxurious gold shimmer press-on nails for special occasions', 1400, '/nails/nail-07.png', '/nails/nail-07.png', 'glitter', true),
('Silver Sparkle', 'Dazzling silver sparkle press-on nails with mirror finish', 1400, '/nails/nail-08.png', '/nails/nail-08.png', 'glitter', true),
('Rose Gold Glow', 'Elegant rose gold press-on nails with warm shimmer', 1400, '/nails/nail-09.png', '/nails/nail-09.png', 'glitter', true),

-- Set 10-12: Trendy Designs
('Marble Bliss', 'Modern marble effect press-on nails with trendy aesthetic', 1350, '/nails/nail-10.png', '/nails/nail-10.png', 'trendy', true),
('Geometric Pop', 'Fun geometric patterns press-on nails for bold statement', 1350, '/nails/nail-11.png', '/nails/nail-11.png', 'trendy', true),
('Ombre Sunset', 'Beautiful ombre sunset gradient press-on nails', 1350, '/nails/nail-12.png', '/nails/nail-12.png', 'trendy', true),

-- Set 13-15: Floral & Nature
('Floral Paradise', 'Delicate floral prints press-on nails with nature vibes', 1350, '/nails/nail-13.png', '/nails/nail-13.png', 'floral', true),
('Garden Rose', 'Romantic rose garden press-on nails for elegant look', 1350, '/nails/nail-14.png', '/nails/nail-14.png', 'floral', true),
('Spring Blossom', 'Fresh spring blossom press-on nails with pastel flowers', 1350, '/nails/nail-15.png', '/nails/nail-15.png', 'floral', true),

-- Set 16-18: Bold & Vibrant
('Deep Plum', 'Rich deep plum press-on nails for sophisticated look', 1300, '/nails/nail-16.png', '/nails/nail-16.png', 'bold', true),
('Electric Blue', 'Vibrant electric blue press-on nails for statement nails', 1300, '/nails/nail-17.png', '/nails/nail-17.png', 'bold', true),
('Coral Crush', 'Lively coral press-on nails perfect for summer season', 1300, '/nails/nail-18.png', '/nails/nail-18.png', 'bold', true),

-- Set 19-21: Premium Collections
('Diamond Luxe', 'Premium diamond-inspired luxury press-on nails', 1500, '/nails/nail-19.png', '/nails/nail-19.png', 'premium', true),
('Pearl Elegance', 'Sophisticated pearl finish press-on nails with lustre', 1500, '/nails/nail-20.png', '/nails/nail-20.png', 'premium', true),
('Velvet Touch', 'Luxurious velvet textured press-on nails for premium feel', 1500, '/nails/nail-21.png', '/nails/nail-21.png', 'premium', true);

-- Step 3: Verify insertion
SELECT COUNT(*) as total_products, 
       MIN(price) as min_price,
       MAX(price) as max_price,
       COUNT(DISTINCT category) as categories
FROM public.products;
