-- Demo Modu Basit Seed Tabloları
-- Bu dosya, demo endpoint'lerinin beklediği minimal tablo setini oluşturur.
-- Zaten kapsamlı schema.sql mevcut; ancak /api/demo/setup endpoint'i şu tabloları varsayıyor:
--   products, branches, personnel, income_records
-- Eğer tam şema kullanıyorsanız products & branches & income_records zaten var olabilir.
-- Aşağıdaki CREATE TABLE komutları "IF NOT EXISTS" ile çalışır ve minimal kolonları içerir.
-- Üretim için schema.sql'deki zengin yapıyı kullanmanız önerilir.

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- NOT: Eğer schema.sql içindeki geniş tablo yapısı kullanılıyorsa
-- branch_id / organization_id gibi dış anahtarlar eklenmeli.
-- Demo amaçlı basit sürüm.

-- İsteğe bağlı: Seed verileri (endpoint idempotent ama ilk yaratım için doğrudan eklemek isteyebilirsiniz)
INSERT INTO branches (name, address) VALUES
  ('Merkez', 'İstiklal Cad. No:1') ON CONFLICT DO NOTHING;
INSERT INTO branches (name, address) VALUES
  ('Şube 2', 'Bağdat Cad. No:45') ON CONFLICT DO NOTHING;

INSERT INTO products (name, price) VALUES
  ('Espresso', 55),
  ('Latte', 65),
  ('Filtre Kahve', 50) ON CONFLICT DO NOTHING;

INSERT INTO personnel (name, title) VALUES
  ('Ayşe', 'Barista'),
  ('Mehmet', 'Kasiyer') ON CONFLICT DO NOTHING;

INSERT INTO income_records (description, amount) VALUES
  ('Günlük Satış', 1250),
  ('Yan Gelir', 300) ON CONFLICT DO NOTHING;
