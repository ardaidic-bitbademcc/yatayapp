# Environment Setup - Quick Guide

## 🚀 Hızlı Başlangıç

Mevcut durumda:
✅ Temel Supabase bağlantısı hazır
⚠️ E2E testler ve demo mode için ek ayarlar gerekli

## Sonraki Adımlar

### 1. E2E Testler için (Opsiyonel)

E2E testleri çalıştırmak istiyorsan:

```bash
# .env.local dosyasına ekle:
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard'dan al>
DEMO_SETUP_TOKEN=6760d5384aa969b431c12e1e5d90f07c034e5a75aaabeab64fab0f7e74866a7b
NEXT_PUBLIC_DEMO_MODE=true
```

**SUPABASE_SERVICE_ROLE_KEY nasıl alınır:**
1. https://app.supabase.com → Projen → Settings → API
2. `service_role` key'ini kopyala
3. `.env.local`'a ekle

### 2. Demo Mode Aktifleştirme (Opsiyonel)

Geliştirme sırasında demo butonlarını görmek için:

```bash
# .env.local dosyasına ekle:
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SETUP_TOKEN=6760d5384aa969b431c12e1e5d90f07c034e5a75aaabeab64fab0f7e74866a7b
```

### 3. Kontrol Et

```bash
cd frontend
npm run check:env
```

## Şu Anki Durum

✅ **Çalışıyor:**
- Normal geliştirme (`npm run dev`)
- Unit testler (`npm test`)
- Production build (`npm run build`)

⚠️ **Eksik (Opsiyonel):**
- E2E testler (`npm run test:e2e`) - SERVICE_ROLE_KEY gerekli
- Demo butonları - DEMO_MODE aktif değil

## Detaylı Dokümantasyon

Daha fazla bilgi için: `docs/ENVIRONMENT_SETUP.md`
