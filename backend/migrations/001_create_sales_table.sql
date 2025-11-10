-- Supabase sales tablosu
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    amount numeric NOT NULL,
    quantity integer DEFAULT 1,
    product_name text NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    personnel_id uuid REFERENCES public.personnel(id) ON DELETE SET NULL,
    description text,
    status text DEFAULT 'completed'
);

-- Örnek seed veri
INSERT INTO public.sales (amount, product_name, description, status)
VALUES
  (100, 'Kahve', 'Vezne satış', 'completed'),
  (250, 'Sandviç', 'POS satış', 'completed');
