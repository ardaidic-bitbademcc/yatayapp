-- Sales tablosuna product_id kolonu ekle
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
