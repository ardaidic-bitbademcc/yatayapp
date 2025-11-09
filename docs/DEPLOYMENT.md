# Deployment Guide (Vercel + Supabase)

Bu rehber, YatayApp'i üretim ve önizleme ortamlarına hızlıca deploy etmek için gereken adımları kapsamlı şekilde açıklar.

## 1) Ön Koşullar

- Supabase projesi (URL, anon key ve service_role key erişimi)
- Vercel hesabı ve organizasyon (repo ile bağlantı ya da Vercel CLI token)
- GitHub repo erişimi ve Secret tanımlama yetkisi (Actions için)

## 2) Supabase Kurulumu (Prod)

1. Supabase Dashboard → SQL Editor
2. Sırasıyla şu dosyaları çalıştırın:
   - `backend/supabase/sql/schema.sql`
   - `backend/supabase/sql/indexes.sql`
   - `backend/supabase/sql/policies.sql`
3. (Opsiyonel) Önizleme/Demo ortamı için `backend/supabase/sql/demo_seed_tables.sql` dosyasını çalıştırın. Bunu prod ortamında kullanmayın.
4. Authentication → Settings kısmından e-posta/smtp ve domain ayarlarını yapılandırın.

Notlar:
- Service Role key sadece sunucu tarafında kullanılmalıdır. İstemciye kesinlikle sızdırmayın.
- RLS (Row Level Security) tüm tablolarda aktif kalmalıdır; prod öncesi dev politikalarını temizlediğinizden emin olun.

## 3) Vercel Deploy (Önerilen: Git Entegrasyonu)

1. Vercel Dashboard → New Project → GitHub repo'yu bağlayın.
2. Framework otomatik olarak Next.js algılanacaktır. Ek yapılandırma gerekmeyebilir.
3. Environment Variables (Production ve Preview sekmeleri) olarak aşağıdakileri ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL` → Supabase Proje URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → Supabase service_role key (Sadece Server, client'a gönderilmez)
   - `NEXT_PUBLIC_DEMO_MODE` → Production: `false`, Preview: `true` (opsiyonel)
   - `DEMO_SETUP_TOKEN` → Sadece Preview ortamında atayın (Demo endpoint'leri için)
   - `NEXT_PUBLIC_SENTRY_DSN` → (opsiyonel) Sentry izleme

4. İlk deploy sonrası aşağıdaki kontrolleri yapın:
   - Prod: `/api/demo/*` endpoint'leri 403 döndürmeli (Demo Mode kapalı)
   - Prod: `/login` sayfası çalışmalı, Supabase auth ile giriş mümkün olmalı
   - Preview: `POST /api/demo/setup` ve `POST /api/demo/user` çağrıları, uygun header/token ile `200` dönmeli

## 4) Vercel CLI ile GitHub Actions üzerinden Deploy (Alternatif)

Repo içinde, E2E sonrası otomatik deploy için `.github/workflows/e2e.yml` dosyasında `deploy` job'ı tanımlıdır. Bu job aşağıdaki GitHub Secrets değerlerine ihtiyaç duyar:

- `VERCEL_TOKEN` → Vercel Account Settings → Tokens
- `VERCEL_ORG_ID` → Vercel Dashboard → Settings → General (Organization ID)
- `VERCEL_PROJECT_ID` → Vercel Project → Settings → General (Project ID)

Ayrıca E2E job'ı için şu Secrets gereklidir:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEMO_SETUP_TOKEN` (sadece preview/demoda gerekli)

İşleyiş:
- `push` (main) olduğunda E2E testleri çalışır.
- E2E başarılı olursa aynı workflow içindeki `deploy` job'ı Vercel CLI ile prod'a deploy eder.

## 5) Demo Mode Sertleştirme (Prod Güvenliği)

- Production'da `NEXT_PUBLIC_DEMO_MODE=false` tutun; böylece demo API'ları 403 döner.
- Preview ortamında demo API'ları için:
  - `x-demo-setup-token` header'ı zorunlu ve gizli olmalı (Vercel Preview env var)
  - (Öneri) Rate limit uygulayın (örn. Upstash Redis Ratelimit, Vercel Edge Middleware)
  - (Öneri) Basit IP allowlist veya Vercel Password Protection ile önizlemeyi koruyun

## 6) Sık Karşılaşılan Sorunlar

- Build uyarıları (OpenTelemetry/Sentry): Ürün işleyişini etkilemez; Sentry entegrasyonu opsiyoneldir.
- Edge Runtime uyarıları: Supabase JS bazı Node API'larına referans verir; App Router içinde SSR/Node context'inde çalıştığından üretimde sorun çıkarmaz.
- 401 "Yetkisiz istek": Demo token doğru header ile gönderilmemiş olabilir; `x-demo-setup-token` kontrol edin.

## 7) Doğrulama Adımları (Check-list)

- [ ] Supabase prod şeması uygulandı, RLS aktif
- [ ] Vercel prod env var'lar atandı (DEMO_MODE=false)
- [ ] Vercel preview env var'lar atandı (DEMO_MODE=true, DEMO_SETUP_TOKEN)
- [ ] GitHub Secrets tanımlandı; E2E pipeline yeşil
- [ ] `main` push → otomatik deploy gerçekleşiyor
- [ ] Canlıda `/login` akışı çalışıyor; korunan sayfalar auth istiyor

Hazır! Takıldığınız bir nokta olursa `docs/CI.md` ve repo kök `README.md` içindeki bağlantılara bakabilirsiniz.
