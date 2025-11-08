import { test, expect } from '@playwright/test';

// Auth E2E testleri: middleware gerçek Supabase auth ile çalışır
// NOT: Gerçek giriş testi için demo kullanıcı gerekir (id:15 todo)

test('unauthenticated user is redirected from protected route to login', async ({ page }) => {
  await page.goto('/branch');
  await expect(page).toHaveURL(/\/login\?redirect=%2Fbranch/);
  await expect(page.getByRole('heading', { name: 'Giriş Yap' })).toBeVisible();
});

// Gerçek password login testini ayrı bir test dosyasında ele alacağız (todo 15)
