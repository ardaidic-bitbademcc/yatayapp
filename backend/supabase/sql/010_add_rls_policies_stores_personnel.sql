-- 010_add_rls_policies_stores_personnel.sql
-- Row Level Security (RLS) politikaları: Veri izolasyonu
-- Kullanıcı sadece kendi mağazasının verisini görebilir/yönetebilir.
-- Süper admin (ileride user_role enum'a eklenecek) tüm mağazaları görebilir.

-- =============================
-- Stores RLS Policies
-- =============================

-- Herkes kendi oluşturduğu mağazaları görebilir (basit başlangıç)
-- Daha gelişmiş: users tablosuna role bazlı izin kontrolü eklenebilir
CREATE POLICY "stores_select_own" ON stores
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'owner')
  );

-- Sadece kendi oluşturduğu mağazayı güncelleyebilir
CREATE POLICY "stores_update_own" ON stores
  FOR UPDATE
  USING (created_by = auth.uid());

-- Sadece kendi oluşturduğu mağazayı silebilir
CREATE POLICY "stores_delete_own" ON stores
  FOR DELETE
  USING (created_by = auth.uid());

-- Herkes mağaza ekleyebilir (süper admin kontrolü frontend/API'de yapılabilir)
CREATE POLICY "stores_insert_all" ON stores
  FOR INSERT
  WITH CHECK (true);

-- =============================
-- Personnel RLS Policies
-- =============================

-- Kullanıcı sadece kendi mağazasının personelini görebilir
-- (personnel.store_id, user'ın kendi mağazası ile eşleşmeli)
-- Basit başlangıç: personnel kendi store_id'si ile filtrelenir
-- İleride: users tablosuna store_id eklenerek daha sıkı kontrol sağlanabilir

CREATE POLICY "personnel_select_own_store" ON personnel
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM personnel WHERE id = auth.uid()
      UNION
      SELECT id FROM stores WHERE created_by = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'owner')
  );

-- Sadece kendi mağazasının personelini ekleyebilir
CREATE POLICY "personnel_insert_own_store" ON personnel
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE created_by = auth.uid()
    )
  );

-- Sadece kendi mağazasının personelini güncelleyebilir
CREATE POLICY "personnel_update_own_store" ON personnel
  FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE created_by = auth.uid()
    )
  );

-- Sadece kendi mağazasının personelini silebilir
CREATE POLICY "personnel_delete_own_store" ON personnel
  FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE created_by = auth.uid()
    )
  );

-- Not: 
-- 1. Süper admin role kontrolü için users tablosunda 'super_admin' rolü eklenebilir.
-- 2. Daha sıkı veri izolasyonu için users tablosuna store_id kolonu eklenerek
--    personnel ve stores'a erişim daha net sınırlandırılabilir.
-- 3. Şu anki yapı, created_by ve store_id ilişkisini baz alıyor.
