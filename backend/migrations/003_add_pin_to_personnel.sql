-- Personnel tablosuna PIN kolonu ekle
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS pin TEXT;

-- Örnek demo PIN'ler (hashed ile değiştirilecek)
-- Demo: PIN '1234' için örnek bcrypt hash (üretim için backend'de hashlenecek)
-- bcrypt hash example: $2b$10$abcdefghijklmnopqrstuv...
