-- 009_create_stores_and_personnel.sql
-- Mağaza ve Personel tabloları, süper admin → mağaza → şube hiyerarşisi ile veri izolasyonu sağlar.
-- Süper admin (role: super_admin) → mağaza yaratır, mağaza kodu (store_code) örn: 2131
-- Mağaza admini (role: store_admin) → kendi mağazasında kullanıcı ve şube yaratır
-- Mağazalar arası veri izolasyonu sağlanır.

-- =============================
-- Stores (Mağazalar)
-- =============================
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code varchar(20) UNIQUE NOT NULL, -- ör: 2131
  name varchar(255) NOT NULL,
  address text,
  phone varchar(20),
  email varchar(255),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL, -- süper admin kim ekledi
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mevcut organizations tablosu yerine stores kullanılacaksa, branches'i stores'a bağlayın.
-- Eğer organizations korunacaksa, store_id opsiyonel olarak organization altında tutulabilir.
-- Şimdilik basit: branches artık store_id ile de ilişkilendirilebilir (opsiyonel migration).

-- =============================
-- Personnel (Personel)
-- =============================
CREATE TABLE IF NOT EXISTS personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  email varchar(255),
  phone varchar(20),
  role varchar(50) NOT NULL, -- ör: store_admin, cashier, staff, chef, waiter
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE, -- hangi mağaza
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL, -- hangi şube (opsiyonel)
  created_by uuid REFERENCES users(id) ON DELETE SET NULL, -- kim ekledi
  pin_hash varchar(255), -- giriş/çıkış için bcrypt hash
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Idempotent Column Additions (personnel tablosu için email ve phone)
-- =============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personnel' AND column_name = 'email'
  ) THEN
    ALTER TABLE personnel ADD COLUMN email varchar(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personnel' AND column_name = 'phone'
  ) THEN
    ALTER TABLE personnel ADD COLUMN phone varchar(20);
  END IF;
END $$;

-- =============================
-- Trigger
-- =============================
CREATE TRIGGER trg_store_updated BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_personnel_updated BEFORE UPDATE ON personnel FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================
-- RLS (ileride eklenecek)
-- =============================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

-- Örnek policy: Kullanıcı sadece kendi mağazasının personelini görebilir.
-- CREATE POLICY "personnel_isolation" ON personnel FOR SELECT USING (
--   store_id IN (SELECT store_id FROM personnel WHERE id = auth.uid())
-- );

-- Not: Süper admin tüm mağazaları görebilir, mağaza admini sadece kendi mağazasını.
-- users tablosuna da role eklenip süper_admin, store_admin ayrımı yapılabilir.
