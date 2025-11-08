-- Row Level Security Politikaları (MVP Odaklı)
-- Sistem design'a göre temel SELECT/INSERT/UPDATE politikaları.
-- Kullanıcılar sadece kendi organizasyonları ve şubeleriyle ilgili verilere erişebilir.

-- =============================
-- Organizations
-- =============================
-- Kullanıcılar sadece kendi organizasyonlarını görebilir
CREATE POLICY "users_view_own_organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================
-- Branches
-- =============================
-- Organizasyon üyeleri tüm şubeleri görebilir
CREATE POLICY "org_members_view_branches"
  ON branches FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Owner/Manager şube oluşturabilir
CREATE POLICY "owners_managers_create_branches"
  ON branches FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Owner/Manager şube güncelleyebilir
CREATE POLICY "owners_managers_update_branches"
  ON branches FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================
-- Users
-- =============================
-- Kullanıcılar kendi organizasyonlarındaki kullanıcıları görebilir
CREATE POLICY "org_members_view_users"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Owner/Manager yeni kullanıcı ekleyebilir
CREATE POLICY "owners_managers_insert_users"
  ON users FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================
-- Categories
-- =============================
CREATE POLICY "org_members_view_categories"
  ON categories FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "owners_managers_manage_categories"
  ON categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================
-- Products
-- =============================
CREATE POLICY "org_members_view_products"
  ON products FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "owners_managers_manage_products"
  ON products FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================
-- Branch Products
-- =============================
-- Şube çalışanları kendi şubelerinin ürünlerini görebilir
CREATE POLICY "branch_staff_view_branch_products"
  ON branch_products FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM users WHERE id = auth.uid()
    )
  );

-- Manager/Owner şube ürünlerini yönetebilir
CREATE POLICY "managers_manage_branch_products"
  ON branch_products FOR ALL
  USING (
    branch_id IN (
      SELECT b.id FROM branches b
      JOIN users u ON u.organization_id = b.organization_id
      WHERE u.id = auth.uid() AND u.role IN ('owner', 'manager')
    )
  );

-- =============================
-- Sales
-- =============================
-- Şube çalışanları kendi şubelerinin satışlarını görebilir
CREATE POLICY "branch_staff_view_sales"
  ON sales FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM users WHERE id = auth.uid()
    )
  );

-- Kasiyer/Manager/Chef kendi şubesinde satış yapabilir
CREATE POLICY "authorized_staff_create_sales"
  ON sales FOR INSERT
  WITH CHECK (
    branch_id IN (
      SELECT branch_id FROM users 
      WHERE id = auth.uid() AND role IN ('cashier', 'manager', 'owner')
    )
  );

-- =============================
-- Sale Items
-- =============================
-- Satış kalemlerini, satışı görme yetkisi olanlar görebilir
CREATE POLICY "staff_view_sale_items"
  ON sale_items FOR SELECT
  USING (
    sale_id IN (
      SELECT s.id FROM sales s
      JOIN users u ON u.branch_id = s.branch_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "authorized_staff_create_sale_items"
  ON sale_items FOR INSERT
  WITH CHECK (
    sale_id IN (
      SELECT s.id FROM sales s
      JOIN users u ON u.branch_id = s.branch_id
      WHERE u.id = auth.uid() AND u.role IN ('cashier', 'manager', 'owner')
    )
  );

-- =============================
-- Payments
-- =============================
CREATE POLICY "staff_view_payments"
  ON payments FOR SELECT
  USING (
    sale_id IN (
      SELECT s.id FROM sales s
      JOIN users u ON u.branch_id = s.branch_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "authorized_staff_create_payments"
  ON payments FOR INSERT
  WITH CHECK (
    sale_id IN (
      SELECT s.id FROM sales s
      JOIN users u ON u.branch_id = s.branch_id
      WHERE u.id = auth.uid() AND u.role IN ('cashier', 'manager', 'owner')
    )
  );

-- =============================
-- Income Records
-- =============================
-- Manager/Owner gelir kayıtlarını görebilir
CREATE POLICY "managers_view_income"
  ON income_records FOR SELECT
  USING (
    branch_id IN (
      SELECT b.id FROM branches b
      JOIN users u ON u.organization_id = b.organization_id
      WHERE u.id = auth.uid() AND u.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "managers_manage_income"
  ON income_records FOR ALL
  USING (
    branch_id IN (
      SELECT b.id FROM branches b
      JOIN users u ON u.organization_id = b.organization_id
      WHERE u.id = auth.uid() AND u.role IN ('owner', 'manager')
    )
  );

-- NOT: Üretim ortamında geçici "dev_*" politikalarını kaldırın.
-- Ek tablolar (shifts, expenses vb.) için politikalar ilerleyen fazlarda eklenecek.
