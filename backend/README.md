# Backend (Supabase)

Bu klasör Supabase backend yapılandırmasını içerir: SQL şema, RLS politikaları, indeksler ve Edge Functions.

## Klasör Yapısı

```
backend/supabase/
├── sql/
│   ├── schema.sql      # Veritabanı tabloları, enum'lar, triggerlar
│   ├── policies.sql    # Row Level Security politikaları
│   └── indexes.sql     # Performans indeksleri
└── functions/
    ├── ai-menu-recommendations/  # AI menü önerileri
    └── calculate-salary/         # Maaş hesaplama
```

## Kurulum

### 1. Supabase Projesi Oluştur

- [Supabase Dashboard](https://app.supabase.com/) üzerinden yeni proje oluştur
- Proje URL ve anon key'i not al

### 2. Şema Yükleme (SQL Editor veya CLI)

#### Yöntem A: Supabase Dashboard SQL Editor

1. Dashboard → SQL Editor'e git
2. Sırayla şu dosyaları çalıştır:
   - `sql/schema.sql` (tablolar, enum'lar, triggerlar)
   - `sql/indexes.sql` (performans indeksleri)
   - `sql/policies.sql` (RLS politikaları)

#### Yöntem B: Supabase CLI (önerilen)

```bash
# CLI kurulumu (henüz yoksa)
npm install -g supabase

# Supabase'e login
supabase login

# Projeye bağlan
supabase link --project-ref <your-project-ref>

# Şemayı deploy et
supabase db push
```

### 3. Edge Functions Deploy

```bash
# Tüm fonksiyonları deploy et
cd backend/supabase
supabase functions deploy ai-menu-recommendations
supabase functions deploy calculate-salary

# Test etmek için
supabase functions serve
```

### 4. Frontend .env Değişkenleri

Frontend `.env.local` dosyasına ekle:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Şema Detayları

### MVP Tabloları

| Tablo | Açıklama |
|-------|----------|
| `organizations` | İşletme bilgileri |
| `branches` | Şubeler |
| `users` | Kullanıcı profilleri (Supabase Auth ile eşleşir) |
| `categories` | Ürün kategorileri (çok seviyeli) |
| `products` | Merkezi ürün kataloğu |
| `branch_products` | Şube bazlı stok ve fiyat |
| `sales` | Satış işlemleri |
| `sale_items` | Satış kalemleri |
| `payments` | Ödeme kayıtları |
| `income_records` | Gelir kayıtları |

### Enum Tipleri

- `user_role`: owner, manager, cashier, chef, staff
- `payment_method`: cash, card, mobile, mixed
- `payment_status`: pending, completed, refunded

### RLS Politikaları

Tüm tablolarda Row Level Security etkin. Kullanıcılar:
- Sadece kendi organizasyonlarına ait verileri görebilir
- Kasiyer: Kendi şubesinde satış yapabilir
- Manager/Owner: Şube ve ürün yönetimi yapabilir
- Roller arası izinler `policies.sql` içinde detaylı tanımlı

## Geliştirme Notları

- **Geçici DEV politikaları**: `schema.sql` ve `policies.sql` içinde yorum satırı olarak bırakılan dev politikaları vardır. Üretim öncesi kaldırılmalı.
- **İleride eklenecekler**: 
  - Faz 2: `shifts`, `shift_assignments`, `time_entries`, `salary_calculations`, `leave_requests`
  - Faz 3: `menu_items`, `recipes`, `menu_engineering_analysis`
  - Faz 4: `expense_categories`, `expenses`, `financial_reports`

## Yardımcı Komutlar

```bash
# Şema değişikliklerini yerel DB'ye uygula
supabase db reset

# Migration oluştur
supabase migration new <migration_name>

# Edge function log izle
supabase functions logs ai-menu-recommendations

# DB type'ları generate et (frontend için)
supabase gen types typescript --local > ../../frontend/src/lib/database.types.ts
```

## Sorun Giderme

**Trigger hatası**: Eğer `set_updated_at()` fonksiyonu zaten varsa, `CREATE OR REPLACE` kullanılır, sorun çıkmaz.

**Foreign key hatası**: `users` ve `branches` arasında circular reference var. `ALTER TABLE` ile DEFERRABLE constraint eklenir.

**RLS testi**: İlk kullanıcıyı ekledikten sonra politikaları test edin. Supabase Dashboard → Authentication → Users üzerinden test kullanıcıları oluşturabilirsiniz.

## Daha Fazla Bilgi

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
