-- Products tablosu (idempotent ve bağımlılıklar için düzeltildi)
-- Not: gen_random_uuid() için pgcrypto gerekir
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  price numeric NOT NULL,
  category text
);

-- Var olan eski tablolar için eksik kolonları ekle (idempotent)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric;

-- Ürün adını benzersiz yaparak seed'in idempotent olmasını sağla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_name_key'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- Örnek ürünler (çoklu çalıştırmada tekrar oluşturmasın)
INSERT INTO public.products (name, price, category)
VALUES
  ('Kahve', 60, 'İçecek'),
  ('Çay', 20, 'İçecek'),
  ('Sandviç', 90, 'Yiyecek')
ON CONFLICT (name) DO NOTHING;
