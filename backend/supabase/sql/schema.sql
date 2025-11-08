-- Supabase Şema (MVP Odaklı)
-- İçerik: organizations, branches, users, categories, products, branch_products,
-- sales, sale_items, payments, income_records + enum tipleri ve triggerlar.
-- Genişletilecek: shifts, time_entries, salary_calculations, expenses vb. (ileriki fazlar)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- ENUM Tipleri
-- =============================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner','manager','cashier','chef','staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash','card','mobile','mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','completed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================
-- Timestamp Otomatik Güncelleme Trigger Fonksiyonu
-- =============================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- Organizations
-- =============================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  tax_number varchar(20) UNIQUE,
  address text,
  phone varchar(20),
  email varchar(255),
  logo_url varchar(500),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Branches
-- =============================
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  code varchar(50) UNIQUE NOT NULL,
  address text,
  phone varchar(20),
  manager_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Users
-- =============================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email varchar(255) UNIQUE NOT NULL,
  full_name varchar(255) NOT NULL,
  phone varchar(20),
  role user_role NOT NULL DEFAULT 'staff',
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  avatar_url varchar(500),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE branches
  ADD CONSTRAINT fk_manager_branch_user FOREIGN KEY (manager_id) REFERENCES users(id) DEFERRABLE INITIALLY DEFERRED;

-- =============================
-- Categories
-- =============================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Products
-- =============================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sku varchar(100) UNIQUE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  cost_price numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0,
  unit varchar(50) DEFAULT 'adet',
  image_url varchar(500),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Branch Products
-- =============================
CREATE TABLE IF NOT EXISTS branch_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_override numeric(10,2),
  stock_quantity numeric(10,2) NOT NULL DEFAULT 0,
  min_stock_level numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean DEFAULT true,
  last_stock_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (branch_id, product_id)
);

-- =============================
-- Sales
-- =============================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  cashier_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  sale_number varchar(50) UNIQUE NOT NULL,
  sale_date timestamptz NOT NULL DEFAULT now(),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- Sale Items
-- =============================
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  notes text
);

-- =============================
-- Payments
-- =============================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  amount numeric(10,2) NOT NULL,
  transaction_id varchar(255),
  payment_date timestamptz NOT NULL DEFAULT now(),
  status payment_status NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- =============================
-- Income Records
-- =============================
CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- =============================
-- Triggerlar
-- =============================
CREATE TRIGGER trg_org_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_branch_updated BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_category_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_product_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_branch_product_updated BEFORE UPDATE ON branch_products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sale_updated BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================
-- RLS Etkinleştirme
-- =============================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

-- Geçici DEV politikaları (Üretimde kaldırılmalı)
-- CREATE POLICY "dev_select_org" ON organizations FOR SELECT USING (true);
-- CREATE POLICY "dev_select_branches" ON branches FOR SELECT USING (true);
-- CREATE POLICY "dev_select_products" ON products FOR SELECT USING (true);

-- İndeksler indexes.sql dosyasında.
