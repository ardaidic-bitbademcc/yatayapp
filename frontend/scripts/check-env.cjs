#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * 
 * Bu script frontend/.env.local dosyasındaki environment variable'ları kontrol eder.
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '../.env.local');
const ENV_EXAMPLE = path.join(__dirname, '../.env.example');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function checkEnvFile() {
  log('\n🔍 Environment Variables Kontrolü\n', colors.bold);

  // .env.local varlığını kontrol et
  if (!fs.existsSync(ENV_FILE)) {
    log('❌ .env.local dosyası bulunamadı!', colors.red);
    log('\n📝 Çözüm:', colors.yellow);
    log('   cp .env.example .env.local');
    log('   # Sonra gerekli değerleri doldur\n');
    return false;
  }

  log('✅ .env.local dosyası mevcut\n', colors.green);

  // .env.local içeriğini oku
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envLines = envContent.split('\n').filter(line => line && !line.startsWith('#'));
  
  const envVars = {};
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key) envVars[key.trim()] = value;
  });

  // Required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  // Optional but recommended
  const recommended = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'DEMO_SETUP_TOKEN',
    'NEXT_PUBLIC_DEMO_MODE'
  ];

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  log('📋 Zorunlu Değişkenler:', colors.bold);
  required.forEach(key => {
    if (envVars[key] && envVars[key].length > 0) {
      const displayValue = key.includes('KEY') ? envVars[key].substring(0, 20) + '...' : envVars[key];
      log(`   ✅ ${key}: ${displayValue}`, colors.green);
    } else {
      log(`   ❌ ${key}: TANIMLI DEĞİL`, colors.red);
      hasErrors = true;
    }
  });

  // Check recommended variables
  log('\n📋 Önerilen Değişkenler (E2E & Demo için):', colors.bold);
  recommended.forEach(key => {
    if (envVars[key] && envVars[key].length > 0) {
      const displayValue = key.includes('KEY') ? envVars[key].substring(0, 20) + '...' : envVars[key];
      log(`   ✅ ${key}: ${displayValue}`, colors.green);
    } else {
      log(`   ⚠️  ${key}: Tanımlı değil (opsiyonel)`, colors.yellow);
      hasWarnings = true;
    }
  });

  // Demo mode check
  log('\n🎭 Demo Mode Durumu:', colors.bold);
  const demoMode = envVars['NEXT_PUBLIC_DEMO_MODE'];
  if (demoMode === 'true') {
    log('   ✅ Demo mode AKTİF', colors.green);
    if (!envVars['DEMO_SETUP_TOKEN'] || envVars['DEMO_SETUP_TOKEN'].length === 0) {
      log('   ⚠️  DEMO_SETUP_TOKEN tanımlı değil - demo endpoints korumasız!', colors.yellow);
      hasWarnings = true;
    }
  } else {
    log('   ℹ️  Demo mode KAPALI (production için önerilir)', colors.blue);
  }

  // E2E test readiness
  log('\n🧪 E2E Test Hazırlığı:', colors.bold);
  const hasServiceRole = envVars['SUPABASE_SERVICE_ROLE_KEY'] && envVars['SUPABASE_SERVICE_ROLE_KEY'].length > 0;
  const hasSetupToken = envVars['DEMO_SETUP_TOKEN'] && envVars['DEMO_SETUP_TOKEN'].length > 0;
  
  if (hasServiceRole && hasSetupToken) {
    log('   ✅ E2E testler çalıştırılabilir', colors.green);
  } else {
    log('   ⚠️  E2E testler için eksik değişkenler:', colors.yellow);
    if (!hasServiceRole) log('      - SUPABASE_SERVICE_ROLE_KEY', colors.yellow);
    if (!hasSetupToken) log('      - DEMO_SETUP_TOKEN', colors.yellow);
  }

  // Security warnings
  log('\n🔒 Güvenlik Kontrolleri:', colors.bold);
  if (envVars['SUPABASE_SERVICE_ROLE_KEY']) {
    log('   ⚠️  SERVICE_ROLE_KEY tanımlı - dikkatli kullan!', colors.yellow);
    log('      Bu key admin yetkilerine sahiptir.', colors.yellow);
  }
  
  if (demoMode === 'true' && (!envVars['DEMO_SETUP_TOKEN'] || envVars['DEMO_SETUP_TOKEN'].length < 32)) {
    log('   ⚠️  DEMO_SETUP_TOKEN çok kısa veya yok - güvenlik riski!', colors.yellow);
    log('      Oluştur: openssl rand -hex 32', colors.yellow);
    hasWarnings = true;
  }

  // Summary
  log('\n' + '='.repeat(50), colors.bold);
  if (hasErrors) {
    log('❌ Zorunlu değişkenler eksik - lütfen tamamla!', colors.red);
    log('\n📖 Detaylar için: docs/ENVIRONMENT_SETUP.md\n', colors.blue);
    return false;
  } else if (hasWarnings) {
    log('⚠️  Bazı opsiyonel değişkenler eksik', colors.yellow);
    log('   Geliştirme için sorun yok, ama E2E testler çalışmayabilir\n', colors.yellow);
    return true;
  } else {
    log('✅ Tüm environment variables hazır!', colors.green);
    log('   npm run dev ile başlayabilirsin\n', colors.green);
    return true;
  }
}

// Run check
const success = checkEnvFile();
process.exit(success ? 0 : 1);
