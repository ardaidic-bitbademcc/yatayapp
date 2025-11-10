-- Masa bölgeleri
CREATE TABLE IF NOT EXISTS public.table_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  sort_order int DEFAULT 0
);

-- Masalar
CREATE TABLE IF NOT EXISTS public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  zone_id uuid REFERENCES public.table_zones(id) ON DELETE CASCADE,
  status text DEFAULT 'empty',
  capacity int,
  UNIQUE(zone_id, name)
);
CREATE INDEX IF NOT EXISTS idx_tables_zone_id ON public.tables(zone_id);

-- Siparişler
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  status text DEFAULT 'open', -- open/paid/cancelled
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  note text
);
CREATE INDEX IF NOT EXISTS idx_orders_table_status ON public.orders(table_id, status);

-- Sipariş kalemleri
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  line_total numeric GENERATED ALWAYS AS (unit_price * quantity) STORED,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Ödemeler
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  method text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- Ödeme yöntemleri (ayarlar)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text,
  active boolean DEFAULT true,
  sort_order int DEFAULT 0
);

INSERT INTO public.payment_methods (name, color, sort_order)
VALUES
  ('cash', '#16a34a', 1),
  ('credit', '#2563eb', 2),
  ('açık hesap', '#a855f7', 3),
  ('havale', '#ea580c', 4),
  ('multinet', '#059669', 5)
ON CONFLICT (name) DO NOTHING;
