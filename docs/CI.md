# CI & Pipeline Rehberi

Bu doküman GitHub Actions tabanlı CI sürecini, tetikleyicileri, kullanılan secret'ları ve raporların nasıl inceleneceğini açıklar.

## 1) Workflow Özeti

Dosya: `.github/workflows/e2e.yml`

Job'lar:
- `e2e`: Playwright E2E testlerini çalıştırır.
- `deploy`: (E2E başarılıysa) Vercel Production deploy'u yapar.

Tetikleyiciler:
```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

## 2) Gerekli GitHub Secrets

E2E için zorunlu:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEMO_SETUP_TOKEN` (yalnızca demo / preview akışı için; prod'da gerekmez)

Deploy için ek olarak:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Öneri: Sentry entegrasyonu kullanacaksanız:
- `NEXT_PUBLIC_SENTRY_DSN`

## 3) Artifact ve Raporlar

Workflow tamamlandıktan sonra Actions run sayfasında iki artifact oluşur:
- `playwright-report` → HTML test raporu (indirip `index.html` açın)
- `test-results` → Ham test outputları / trace (Playwright trace viewer ile analiz edilebilir)

## 4) Yerel Olarak E2E Çalıştırma

```bash
cd frontend
cp .env.example .env.local
# .env.local içine gerekli Supabase ve demo değişkenlerini doldurun
npm run test:e2e
```

## 5) Debug İpuçları

| Belirti | Olası Sebep | Çözüm |
|---------|-------------|-------|
| 401 Yetkisiz (demo endpoint) | Eksik veya hatalı `x-demo-setup-token` | Header ve Secret eşleşmesini kontrol edin |
| Supabase tablo hatası | Şema uygulanmamış | `backend/supabase/sql/demo_seed_tables.sql` veya tam şemayı çalıştırın |
| Playwright test skip | Gerekli env yok | Secrets / `.env.local` doldurun |
| Deploy job atlıyor | E2E başarısız veya PR build | Önce E2E'yi yeşile döndürün, main'e push edin |

## 6) İyileştirme Önerileri (Gelecek)

- Cache: Playwright browser cache'i için ayrı adım eklenebilir.
- Paralel test shard: Büyük test setlerinde `strategy.matrix` ile parçalama.
- Coverage raporu upload: Codecov / Coveralls entegrasyonu.
- Ratelimit / güvenlik testleri ek job.

## 7) Sürümleme & Otomasyon

- Tag push (örn. `v*`) durumunda opsiyonel release job eklenebilir.
- Semantic-release veya Changesets ile otomatik sürüm notları.

## 8) Sık Sorulanlar

S: Service role key neden testlerde gerekiyor?  
C: Demo kullanıcı oluşturma endpoint'i admin API kullanıyor; E2E akışı bu kullanıcıyı yaratıp login akışını doğruluyor.

S: Production deploy öncesi manuel onay ister miyiz?  
C: İstenirse `environment: production` ve `wait_timer` veya `protection rules` kullanılabilir.

---
Bu dosya CI sürecine dair temel referanstır; değişiklik yaptığınızda güncel kalmasını sağlayın.
