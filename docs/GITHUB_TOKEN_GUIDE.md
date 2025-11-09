# GitHub Personal Access Token Oluşturma Rehberi (Detaylı)

Bu rehber, GitHub arayüzünde Developer Settings bölümünü bulamayan kullanıcılar için token oluşturma sürecini alternatif yollarla açıklar.

## Yöntem 1: Doğrudan Link ile Erişim (En Kolay)

Tarayıcıda direkt bu adreslere git:

### Classic Token (Önerilen - Daha Basit):
```
https://github.com/settings/tokens/new
```

### Fine-Grained Token (Daha Kısıtlı):
```
https://github.com/settings/personal-access-tokens/new
```

---

## Yöntem 2: Menüden Adım Adım

### A) Profil Menüsünden:
1. GitHub.com → Sağ üst köşedeki profil fotoğrafına tıkla
2. Açılan menüden **Settings** seç
3. Sol sidebar'da EN ALTA in:
   - **Developer settings** yazıyor (genelde son veya sondan ikinci sırada)
   - Göremiyorsan sayfa sonuna scroll et
   - Bazı hesaplarda "Code, planning, and automation" başlığı altında

### B) Developer Settings Görünmüyorsa:
GitHub hesap türüne göre farklı yerlerde olabilir:

**Personal Hesap:**
- Settings → Developer settings (en altta)

**Organization Üyesi:**
- Organization settings'e karışmış olabilir
- Kendi hesap Settings'ine git (avatar → Settings, ORG sayfası değil)
- Sol menüde "Developer settings"

### C) Mobil veya Dar Ekran:
1. Tarayıcı menüsünden "Desktop Site" veya "Masaüstü Sitesi"ni aç
2. Genişlik arttığında Developer settings görünür hale gelir

---

## Yöntem 3: Token Oluşturma Adımları (Classic PAT)

Link: https://github.com/settings/tokens/new

### 1. Note (Token Açıklaması):
```
yatayapp-ci-deploy
```

### 2. Expiration (Süre):
- **90 days** (önerilen, bitince yenilenir)
- veya Custom: istediğin tarih
- No expiration (güvenlik riski, önerilmez)

### 3. Select Scopes (Yetkiler):
Aşağıdaki kutucukları **işaretle**:

✅ **repo** (tamamı - alt seçenekleri otomatik seçer)
   - repo:status
   - repo_deployment
   - public_repo
   - repo:invite
   - security_events

✅ **workflow** (GitHub Actions yazma)

⬜ admin:repo_hook (isteğe bağlı, webhook yönetimi)
⬜ read:org (sadece organization üyesi isen)

### 4. Generate Token:
- Yeşil **Generate token** butonuna bas
- Ekranda `ghp_...` şeklinde token görünür
- **ÖNEMLİ:** Bu token bir daha gösterilmeyecek!
- Hemen **kopyala** ve güvenli yere kaydet (1Password, Bitwarden, vs.)

---

## Yöntem 4: Fine-Grained Token (Alternatif - Daha Güvenli)

Link: https://github.com/settings/personal-access-tokens/new

### 1. Token Name:
```
yatayapp-ci-deploy
```

### 2. Expiration:
90 days önerilen

### 3. Resource Owner:
Kendi kullanıcı adın

### 4. Repository Access:
- **Only select repositories** seç
- `ardaidic-bitbademcc/yatayapp` ekle

### 5. Permissions → Repository Permissions:
- **Actions**: Read and write
- **Secrets**: Read and write (bazı hesaplarda Actions yeterli olur)
- **Contents**: Read (varsayılan)
- **Metadata**: Read (otomatik)

### 6. Generate:
Token'ı kopyala ve sakla

---

## Token'ı Kullanma (gh CLI ile)

Terminal'de:

```bash
gh auth logout
gh auth login
```

Sorular:
- **What account...?** → GitHub.com
- **What is your preferred protocol...?** → HTTPS
- **Authenticate Git with...?** → Yes
- **How would you like to authenticate...?** → Paste an authentication token
- **Paste your authentication token:** → Token'ı yapıştır (Ctrl+V veya Cmd+V)

Doğrulama:
```bash
gh auth status
```

Çıktıda ✓ işareti ve "Logged in to github.com account ardaidic-bitbademcc" görmeli

---

## Sorun Giderme

### "Developer settings bulamıyorum"
1. Tarayıcıda: https://github.com/settings/tokens/new
2. Giriş yapılmış mı kontrol et
3. Desktop Site moduna geç
4. Adblocker kapalı mı kontrol et

### "Generate token butonu pasif"
- En az bir scope işaretlemelisin (repo + workflow)
- Expiration seçilmiş olmalı

### "Token oluşturuldu ama görünmüyor"
- Sayfa yüklendiğinde yeşil kutuda token görünür
- Eğer kapatırsan bir daha GÖREMEZSİN
- Yeni token oluştur: https://github.com/settings/tokens/new

### "Organization policy engelliyor"
- Organization owner izni gerekebilir
- Personal hesabında dene
- Repo'yu kendi hesabına fork et ve oraya token ekle

---

## Alternatif: GitHub UI'den Secrets Manuel Ekleme

Token oluşturamassan, secrets'ı GitHub web arayüzünden manuel ekleyebilirsin:

1. https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions
2. **New repository secret**
3. Name ve Value gir
4. **Add secret**

Her secret için tekrarla (7 adet):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DEMO_SETUP_TOKEN
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

---

## Güvenlik Notları

- Token'ı kimseyle paylaşma
- Public repoya commit etme
- .gitignore'da `.env.secrets` olduğundan emin ol
- Token süresi dolmadan yenile
- Kullanılmayan token'ları sil: https://github.com/settings/tokens

---

## Hızlı Link Özeti

| İşlem | Link |
|-------|------|
| Classic PAT oluştur | https://github.com/settings/tokens/new |
| Fine-grained PAT oluştur | https://github.com/settings/personal-access-tokens/new |
| Mevcut token'ları gör | https://github.com/settings/tokens |
| Repo secrets ayarları | https://github.com/ardaidic-bitbademcc/yatayapp/settings/secrets/actions |

---

Eğer yukarıdaki linkler çalışmazsa:
1. GitHub'dan çıkış yap, tekrar giriş yap
2. Tarayıcı cache'i temizle
3. Farklı tarayıcıda dene (Chrome, Firefox, Safari)
4. Incognito/Private mode'da dene
