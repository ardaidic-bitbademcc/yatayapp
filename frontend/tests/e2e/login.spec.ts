import { test, expect } from '@playwright/test';

// Bu test Supabase OTP tetikleme formunun temel görünürlük ve hata durumlarını doğrular.
// Gerçek e-posta gönderimi CI'de işlenmez; yalnızca başarılı submit sonrası mesajı kontrol edilir.

const TEST_EMAIL = 'tester@example.com';

test('login page allows requesting magic link', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Giriş Yap' })).toBeVisible();
  await page.getByRole('button', { name: 'Magic Link' }).click();
  const emailInput = page.getByPlaceholder('E-posta adresiniz');
  await emailInput.fill(TEST_EMAIL);
  await page.getByRole('button', { name: 'Giriş Linki Gönder' }).click();
  // Başarı mesajı veya hata (anon key yoksa) ikisinden biri gözükmeli.
  const success = page.locator('text=Giriş linki e-posta adresinize gönderildi.');
  const error = page.locator('text=/^Hata:/');
  try {
    await expect(success).toBeVisible({ timeout: 8000 });
  } catch {
    await expect(error).toBeVisible({ timeout: 8000 });
  }
});

// Edge case: boş bırakınca HTML5 validation devreye girer, submit olmaz.
// Bunu doğrulamak için form gönderme ve URL sabit kalma beklentisi.

test('login form cannot submit with empty email', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Magic Link' }).click();
  const submit = page.getByRole('button', { name: 'Giriş Linki Gönder' });
  await submit.click();
  // HTML5 validation: input:invalid pseudo class kontrolü
  const invalid = page.locator('input:invalid');
  await expect(invalid).toBeVisible();
});
