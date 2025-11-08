# Entegre POS Sistemi (YatayApp)

Bu depo, Supabase tabanlı backend ve Next.js 14 (App Router) tabanlı frontend ile geliştirilecek entegre POS sisteminin iskelet yapısını barındırır. Bu aşamada, mimari dokümana göre klasör yapısı, diyagramlar ve ilk teknik notlar hazırlanmıştır.

## Klasör Yapısı

- `docs/` — Mimari diyagramlar, kararlar ve teknik dokümanlar
- `frontend/` — Next.js 14 + TypeScript tabanlı web uygulaması (iskelet)
- `backend/` — Supabase SQL, RLS politikaları ve Edge Functions (iskelet)
- `infra/` — Altyapı ve dev ortamı talimatları
- `scripts/` — Yardımcı scriptler ve geliştirici araçları (ileride)

## Hızlı Başlangıç

Bu repo şu an mimari iskeleti ve temel başlangıç kodlarını içerir.

1. Frontend (Next.js 14) kurulumu:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local # Supabase URL ve anon key gir
   npm run dev
   ```
2. Supabase şemasını uygulama (lokal Supabase CLI veya dashboard):
   - `backend/supabase/sql/schema.sql`
   - `backend/supabase/sql/indexes.sql`
   - RLS etkinleştir ve `policies.sql` taslağını uyarlayarak ekle
3. Edge Functions deploy (isteğe bağlı erken test):
   - `ai-menu-recommendations`
   - `calculate-salary`
4. Diyagram üretimi:
   - `docs/diagrams/*.puml` PlantUML ile PNG/SVG’ye dönüştür

Detaylı adımlar ilgili klasörlerin README dosyalarında bulunmaktadır.

## Notlar ve Varsayımlar

- Backend Supabase üzerinde yönetilecek (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- Frontend Next.js 14 (App Router) kullanılacak, PWA ve offline-first desteklenecek
- Ödeme altyapısı olarak ilk etapta PayTR/POS cihazları (PAVO/Ingenico) hedeflenmiştir (entegrasyon aşaması Faz 5)
- E-fatura entegrasyonu planlıdır (Faz 5)

## Yol Haritası (Özet)

- Faz 1: MVP (POS, ürün/stok, auth, raporlama temel)
- Faz 2: Personel ve Şube
- Faz 3: Menü ve AI
- Faz 4: Finans ve Optimizasyon
- Faz 5: Entegrasyonlar (Ödeme, E-Fatura)

Geliştirici notları ve teknik kararlar için `docs/` klasörüne bakınız.
