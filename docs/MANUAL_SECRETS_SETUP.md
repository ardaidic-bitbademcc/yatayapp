# Manuel GitHub Secrets Ekleme Rehberi

Token oluşturamıyorsan, GitHub web arayüzünden secrets'ı manuel ekleyebilirsin. Bu yöntem daha uzun ama garanti çalışır.

## 1. Secrets Sayfasına Git

### Doğrudan Link:
```
https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions
```

### Veya Menüden:
1. https://github.com/ardaidic-bitbademcc/yatayapp
2. Üst menüde **Settings** sekmesi
3. Sol sidebar → **Secrets and variables** → **Actions**
4. **New repository secret** (yeşil buton)

---

## 2. Supabase Değerlerini Topla

### Adım 1: Supabase Dashboard'a Git
https://app.supabase.com/

### Adım 2: Projeyi Seç
`tovrflqwkwjscrorgbiu` (zaten kullandığın proje)

### Adım 3: Key'leri Kopyala
Sol menü → **Settings** → **API**

| Secret Adı | Supabase'deki Alanı | Örnek (Kendi değerini kullan) |
|-----------|-------------------|------------|
| NEXT_PUBLIC_SUPABASE_URL | Project URL | https://tovrflqwkwjscrorgbiu.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | anon public | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (uzun JWT) |
| SUPABASE_SERVICE_ROLE_KEY | service_role (⚠️ Secret) | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (farklı JWT) |

**ÖNEMLİ:** service_role key çok hassas! Sadece server tarafında kullan, kimseyle paylaşma.

---

## 3. Demo Token Oluştur (Opsiyonel)

### Zaten varsa:
Mevcut `.env.local` dosyanda:
```
DEMO_SETUP_TOKEN=20537fdb92bb2de0c6ce68512433c01027079a8afaeffb4152a39a09ce7d59e1
```

### Yeni üretmek istersen:
```bash
openssl rand -hex 32
```

**Not:** Production'da demo mode kapalı olacak, bu token sadece preview/test için.

---

## 4. Vercel Değerlerini Topla

### Adım 1: Vercel Dashboard
https://vercel.com/dashboard

### Adım 2: Proje Oluştur (eğer henüz yoksa)
1. **Add New...** → **Project**
2. GitHub repo'yu seç: `ardaidic-bitbademcc/yatayapp`
3. Framework: Next.js (otomatik algılar)
4. Root Directory: `frontend`
5. **Deploy** (ilk deploy yapılacak, env'ler sonra eklenecek)

### Adım 3: Token Al
1. Sağ üst profil → **Account Settings**
2. Sol menü → **Tokens**
3. **Create Token**
   - Name: `yatayapp-deploy`
   - Scope: Full Account (veya sadece ilgili projeyi seç)
4. **Create** → Token'ı kopyala
   - `vercel_...` şeklinde başlar
   - Bir daha gösterilmez!

### Adım 4: Org ID ve Project ID
1. Vercel Dashboard → `yatayapp` projesini seç
2. **Settings** sekmesi
3. **General** sekmesi:
   - **Project ID**: `prj_...` şeklinde (kopyala)
4. Sağ üst (veya Settings → General altında):
   - **Team / Personal Account** → Settings:
   - **Team ID** veya **Personal Account ID**: `team_...` veya başka format (kopyala)

**Not:** Personal account isen "Team ID" yerine kendi user ID'n olacak.

---

## 5. GitHub'a Secrets Ekle (Tek Tek)

Her biri için:
1. https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions
2. **New repository secret**
3. Name ve Value gir
4. **Add secret**

### 5.1. NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://tovrflqwkwjscrorgbiu.supabase.co`

### 5.2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (Supabase → API → anon public key)

### 5.3. SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (Supabase → API → service_role key) ⚠️ GİZLİ

### 5.4. DEMO_SETUP_TOKEN
- **Name:** `DEMO_SETUP_TOKEN`
- **Value:** `20537fdb92bb2de0c6ce68512433c01027079a8afaeffb4152a39a09ce7d59e1`

### 5.5. VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** (Vercel → Settings → Tokens → oluşturduğun token)

### 5.6. VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** (Vercel → Project Settings → General → Team/Personal ID)

### 5.7. VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** (Vercel → Project Settings → General → Project ID)

---

## 6. Vercel Environment Variables Ekle

### Production Ortamı:
1. Vercel Dashboard → Projen → **Settings** → **Environment Variables**
2. Aşağıdaki her biri için **Add** buton:

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | https://tovrflqwkwjscrorgbiu.supabase.co | Production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (anon key) | Production |
| SUPABASE_SERVICE_ROLE_KEY | (service role key) | Production |
| NEXT_PUBLIC_DEMO_MODE | false | Production |

**Önemli:** SUPABASE_SERVICE_ROLE_KEY için "Encrypted" veya "Sensitive" seçeneği varsa işaretle.

### Preview Ortamı (Opsiyonel):
Demo mode'u preview'da aktif tutmak istersen:

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | (aynı veya test instance) | Preview |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (aynı) | Preview |
| SUPABASE_SERVICE_ROLE_KEY | (aynı) | Preview |
| NEXT_PUBLIC_DEMO_MODE | true | Preview |
| DEMO_SETUP_TOKEN | (ürettiğin token) | Preview |

---

## 7. Değişiklikleri GitHub'a Push Et

Secrets ve workflow hazır olduğuna göre, main branch'e bir commit push et:

```bash
cd /workspaces/yatayapp
git add .
git commit -m "feat: CI/CD pipeline ve deployment dokümantasyonu"
git push origin main
```

---

## 8. GitHub Actions'da İzle

1. https://github.com/ardaidic-bitbademcc/yatayapp/actions
2. En son workflow çalışıyor olmalı
3. **e2e** job'ı yeşil geçerse → **deploy** job başlar
4. Deploy sonunda Vercel'de yeni deployment görünür

---

## 9. Doğrulama Check-list

| Adım | Komut / Link | Beklenen |
|------|--------------|----------|
| Secrets listesi | https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions | 7 secret görünmeli |
| E2E job | Actions → Latest run → e2e | ✅ Geçti |
| Deploy job | Actions → Latest run → deploy | ✅ Geçti (sadece main push'ta) |
| Vercel deployment | https://vercel.com/dashboard | Yeni deployment başarılı |
| Site açılıyor | Vercel'den aldığın URL | Next.js sayfası görünüyor |
| Demo kapalı (prod) | `curl https://<prod-url>/api/demo/setup` | 403 "Demo modu kapalı" |

---

## 10. Sorun Giderme

### E2E Job Hata Veriyor:
- Actions log'unda "Missing env" yazıyorsa secret adını kontrol et (büyük/küçük harf)
- Service role key doğru mu: Supabase Dashboard'dan tekrar kopyala

### Deploy Job Atladı:
- Sadece `main` branch push'ta çalışır
- E2E başarılı olmalı (önce onu düzelt)
- PR'da deploy job çalışmaz (sadece E2E)

### Vercel Deploy Başarısız:
- VERCEL_TOKEN doğru mu: Token'ı yeniden oluştur
- VERCEL_ORG_ID ve VERCEL_PROJECT_ID karışmış olabilir: Settings'ten tekrar kopyala
- Vercel CLI login gerekebilir: `vercel login` (lokal test için)

### Production'da Demo Açık Kaldı:
- Vercel → Settings → Environment Variables
- NEXT_PUBLIC_DEMO_MODE'u `false` yap
- Redeploy: Vercel → Deployments → ... → Redeploy

---

## 11. İleride Yapılacaklar (Opsiyonel)

- [ ] Sentry DSN ekle (hata izleme)
- [ ] Rate limit middleware (demo endpoint'lere)
- [ ] Secret rotation scripti (token süresi dolduğunda)
- [ ] Staging environment (ayrı Supabase + Vercel preview)

---

## Yardım Linkleri

- GitHub Secrets: https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions
- GitHub Actions: https://github.com/ardaidic-bitbademcc/yatayapp/actions
- Supabase Dashboard: https://app.supabase.com/project/tovrflqwkwjscrorgbiu
- Vercel Dashboard: https://vercel.com/dashboard
- Workflow dosyası: `.github/workflows/e2e.yml`

---

Tüm adımları takip ettikten sonra, main'e push yaptığında otomatik olarak:
1. E2E testleri çalışır
2. Testler başarılı olursa Vercel'e deploy edilir
3. Canlı URL'den uygulamaya erişebilirsin

Herhangi bir adımda takıldıysan lütfen bildir!
