-- Sales tablosuna order_id ekle ve indeksle
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON public.sales(order_id);
