-- Sales tablosuna product_id, quantity ve total kolonları ekle
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total numeric GENERATED ALWAYS AS (amount * quantity) STORED;
