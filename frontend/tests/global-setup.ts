import { chromium, FullConfig } from '@playwright/test';

/**
 * Playwright Global Setup
 * 
 * Tüm E2E testlerinden ÖNCE çalışır.
 * Demo kullanıcıyı oluşturur (demo@yatay.app).
 * 
 * Gereksinimler:
 * - NEXT_PUBLIC_DEMO_MODE=true
 * - SUPABASE_SERVICE_ROLE_KEY (Supabase admin işlemleri için)
 * - DEMO_SETUP_TOKEN (API endpoint security)
 * 
 * Eğer credentials yoksa, sessizce skip eder (E2E testler de skip edilir).
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Playwright Global Setup: Demo user kontrol ediliyor...');

  // Credentials kontrolü
  const hasCredentials = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
                         !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasCredentials) {
    console.log('⏭️  Supabase credentials yok, demo user setup atlanıyor');
    console.log('   E2E testler otomatik olarak skip edilecek');
    return;
  }

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const demoSetupToken = process.env.DEMO_SETUP_TOKEN || 'test-token';

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Demo user API'sine istek at
    const response = await page.request.post(`${baseURL}/api/demo/user`, {
      headers: {
        'Content-Type': 'application/json',
        'x-demo-setup-token': demoSetupToken,
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      console.warn('⚠️  Demo user oluşturulamadı (zaten var olabilir):', response.status());
      // Hata fırlatma - kullanıcı zaten mevcut olabilir
    } else {
      const result = await response.json();
      console.log('✅ Demo user hazır:', result.user?.email || 'demo@yatay.app');
    }

    await browser.close();
  } catch (error) {
    console.warn('⚠️  Global setup uyarısı:', error);
    // Hata fırlatma - testlerin çalışmasına izin ver
  }
}

export default globalSetup;
