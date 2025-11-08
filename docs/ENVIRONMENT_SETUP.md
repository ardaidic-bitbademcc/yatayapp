# Environment Setup Guide

Bu dokümantasyon, yatayapp projesinin environment variable'larını yapılandırmak için gerekli adımları içerir.

## Required Environment Variables

### 1. Supabase Configuration (Zorunlu)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Nasıl alınır:**
1. [Supabase Dashboard](https://app.supabase.com) → Project seç
2. Settings → API
3. `URL` ve `anon/public` key'i kopyala

### 2. Supabase Service Role Key (E2E Tests & Demo için gerekli)

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Nasıl alınır:**
1. Supabase Dashboard → Settings → API
2. `service_role` key'i kopyala

⚠️ **UYARI**: Bu key admin yetkilerine sahiptir. Asla client-side'da kullanmayın veya commit etmeyin!

**Kullanım alanları:**
- Demo user oluşturma (`/api/demo/user`)
- E2E testleri (Playwright global-setup)
- Admin operasyonları

### 3. Demo Mode Configuration

```bash
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SETUP_TOKEN=your-secure-random-token
```

**DEMO_SETUP_TOKEN nasıl oluşturulur:**
```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Kullanım:**
- `NEXT_PUBLIC_DEMO_MODE=true`: Demo butonlarını aktif eder
- `DEMO_SETUP_TOKEN`: Demo API endpoint'lerini korur (`/api/demo/setup`, `/api/demo/user`)

### 4. Sentry (Opsiyonel - Error Tracking)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Setup Steps

### Development Environment

1. `.env.local` dosyasını oluştur:
```bash
cd frontend
cp .env.example .env.local
```

2. Supabase credentials'ları doldur:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tovrflqwkwjscrorgbiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. (Opsiyonel) Demo mode aktif et:
```bash
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SETUP_TOKEN=$(openssl rand -hex 32)
```

4. (Opsiyonel) E2E testler için service role key ekle:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### E2E Tests Setup

E2E testleri çalıştırmak için:

```bash
# 1. Service role key ekle (.env.local)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. Demo setup token ekle
DEMO_SETUP_TOKEN=your-secure-token

# 3. Demo mode aktif et
NEXT_PUBLIC_DEMO_MODE=true

# 4. Playwright testlerini çalıştır
npm run test:e2e
```

**Test akışı:**
1. `global-setup.ts` otomatik olarak demo user oluşturur (`demo@yatay.app`)
2. E2E testler bu user ile giriş yapar
3. Credential yoksa testler otomatik skip edilir

### Production Environment

Production'da:

✅ **Ekle:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **Ekleme:**
- `SUPABASE_SERVICE_ROLE_KEY` (gerekliyse çok dikkatli kullan)
- `NEXT_PUBLIC_DEMO_MODE=true` (production'da demo mode kapalı olmalı)

## Environment Variable Kontrol

Tüm variable'ların doğru yüklendiğini kontrol et:

```bash
npm run check:env
```

Veya manuel olarak:

```bash
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Supabase URL set' : '❌ Missing Supabase URL')"
```

## Security Best Practices

1. ✅ `.env.local` dosyası `.gitignore`'da olmalı
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` asla commit edilmemelidir
3. ✅ Production'da `DEMO_MODE=false` olmalı
4. ✅ `DEMO_SETUP_TOKEN` güçlü ve random olmalı
5. ✅ Service role key sadece server-side API routes'ta kullanılmalı

## Troubleshooting

### "Demo modu kapalı" hatası
- `NEXT_PUBLIC_DEMO_MODE=true` ekle ve sunucuyu yeniden başlat

### "Yetkisiz istek" hatası (demo endpoints)
- `DEMO_SETUP_TOKEN` değerini kontrol et
- API request'inde `x-demo-setup-token` header'ı gönderiliyor mu?

### E2E testler skip ediliyor
- `SUPABASE_SERVICE_ROLE_KEY` tanımlı mı kontrol et
- `.env.local` dosyası `frontend/` dizininde olmalı

### "Cannot connect to Supabase" hatası
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru mu?
- Supabase project aktif mi kontrol et

## Example .env.local (Full)

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://tovrflqwkwjscrorgbiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Demo Mode (Optional - Development only)
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SETUP_TOKEN=a1b2c3d4e5f6...

# Admin Operations (Optional - E2E tests)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

## Quick Start Checklist

- [ ] `.env.local` dosyası oluşturuldu
- [ ] Supabase URL ve Anon Key eklendi
- [ ] Demo mode (opsiyonel) aktif edildi
- [ ] Service role key (E2E için) eklendi
- [ ] `npm run dev` ile test edildi
- [ ] Demo butonları çalışıyor (demo mode aktifse)
- [ ] Login başarılı (demo user ile)

## Support

Sorun yaşarsan:
1. Environment variable'ları kontrol et: `npm run check:env`
2. Supabase dashboard'da project aktif mi kontrol et
3. Console'da hata mesajlarını incele
4. `.env.local` dosyasının doğru yerde olduğunu kontrol et
