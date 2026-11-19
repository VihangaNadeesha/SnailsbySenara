-- Fix product schema to match API requirements
-- Add missing columns: available_sizes, inventory, is_available

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT ARRAY['XS','S','M','L'],
ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update all existing products with default values
UPDATE public.products 
SET 
  available_sizes = ARRAY['XS','S','M','L'],
  inventory = 50,
  is_available = true
WHERE available_sizes IS NULL 
   OR inventory IS NULL 
   OR is_available IS NULL;
