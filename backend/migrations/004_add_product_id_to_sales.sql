-- Sales tablosuna product_id ve quantity kolonları ekle
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
