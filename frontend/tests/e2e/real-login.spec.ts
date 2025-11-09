import { test, expect } from '@playwright/test';

// Gerçek password login akışı E2E testi
// NOT: Demo kullanıcı global-setup.ts ile otomatik oluşturulur
// Eğer Supabase credentials yoksa testler skip edilir

const DEMO_EMAIL = 'demo@yatay.app';
const DEMO_PASSWORD = 'Demo1234!';

// Supabase credentials varsa testleri çalıştır, yoksa skip et
const shouldRunTests = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

test.describe('Real Login Flow', () => {
  test.skip(!shouldRunTests, 'Skipping: Supabase credentials not configured');

  test('demo user can login with password and access protected route', async ({ page }) => {
    // Login sayfasına git
    await page.goto('/login');
    
    // E-posta/Şifre modunu seç (varsayılan)
    await page.getByPlaceholder('E-posta adresiniz').fill(DEMO_EMAIL);
    await page.getByPlaceholder('Şifreniz').fill(DEMO_PASSWORD);
    
    // Giriş yap (birden fazla "Giriş Yap" butonu olduğundan form içindeki submit butonunu seçiyoruz)
    const submitButton = page.locator('form').getByRole('button', { name: 'Giriş Yap' });
    await submitButton.click();
    
    // Ana sayfaya yönlendir (başarılı giriş)
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText(`Giriş yapan: ${DEMO_EMAIL}`)).toBeVisible({ timeout: 5000 });
    
    // Korunan bir sayfaya git
    await page.goto('/branch');
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (demoMode) {
      // Demo modunda middleware server-side session cookie olmadan redirect edebilir
      await expect(page).toHaveURL(/\/login\?redirect=%2Fbranch/);
    } else {
      await expect(page).toHaveURL(/\/branch/);
      await expect(page.getByRole('heading', { name: 'Şube Yönetimi' })).toBeVisible();
    }
  });

  test('login fails with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('E-posta adresiniz').fill('wrong@example.com');
    await page.getByPlaceholder('Şifreniz').fill('wrongpass');
    
    const submitButton = page.locator('form').getByRole('button', { name: 'Giriş Yap' });
    await submitButton.click();
    
    // Hata mesajı görünmeli
    await expect(page.locator('text=/Hata:/i')).toBeVisible({ timeout: 5000 });
  });
});
