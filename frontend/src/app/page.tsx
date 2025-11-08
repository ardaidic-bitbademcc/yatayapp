// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import * as Sentry from '@sentry/nextjs';

export default function HomePage() {
  const [stats, setStats] = useState({ sales: 0, products: 0, personnel: 0, branches: 0 });
  const [loading, setLoading] = useState(false);

  const testSentryError = () => {
    try {
      throw new Error('Test Sentry hata yakalama');
    } catch (err) {
      Sentry.captureException(err);
      console.error('Sentry\'ye gönderildi:', err);
      alert('Test hatası Sentry\'ye gönderildi (konsolu kontrol edin).');
    }
  };

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const [{ count: sales }, { count: products }, { count: personnel }, { count: branches }] = await Promise.all([
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('personnel').select('*', { count: 'exact', head: true }),
        supabase.from('branches').select('*', { count: 'exact', head: true })
      ]);
      setStats({
        sales: sales ?? 0,
        products: products ?? 0,
        personnel: personnel ?? 0,
        branches: branches ?? 0
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8" role="heading" aria-level={1}>YatayApp</h1>
        
        {process.env.NEXT_PUBLIC_SENTRY_DSN && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 mb-2">Sentry aktif (geliştirme/test modu)</p>
            <Button size="sm" variant="outline" onClick={testSentryError}>
              🐛 Hata Testi (Sentry)
            </Button>
          </div>
        )}

        {/* ...modül kartları... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ...modül kartları kodu değişmedi... */}
          <Link href="/pos">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">🛒</div>
              <h2 className="text-xl font-bold mb-2">POS Satış</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Hızlı satış işlemleri, ürün yönetimi ve stok takibi
              </p>
              <Button size="sm" className="w-full">Satış Yap →</Button>
            </div>
          </Link>
          <Link href="/personnel">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">👥</div>
              <h2 className="text-xl font-bold mb-2">Personel</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Vardiya, puantaj, maaş hesaplama ve izin yönetimi
              </p>
              <Button size="sm" className="w-full" variant="outline">Yönet →</Button>
            </div>
          </Link>
          <Link href="/branch">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">🏪</div>
              <h2 className="text-xl font-bold mb-2">Şube Yönetimi</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Çoklu şube yönetimi ve merkezi ürün kontrolü
              </p>
              <Button size="sm" className="w-full" variant="outline">Görüntüle →</Button>
            </div>
          </Link>
          <Link href="/menu">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">📋</div>
              <h2 className="text-xl font-bold mb-2">Menü Mühendisliği</h2>
              <p className="text-sm text-muted-foreground mb-4">
                AI destekli menü optimizasyonu ve maliyet analizi
              </p>
              <Button size="sm" className="w-full" variant="outline">Analiz Et →</Button>
            </div>
          </Link>
          <Link href="/finance">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">💰</div>
              <h2 className="text-xl font-bold mb-2">Finans</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Gelir-gider takibi, kar-zarar raporu ve tahmin
              </p>
              <Button size="sm" className="w-full" variant="outline">Raporla →</Button>
            </div>
          </Link>
          <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg opacity-60">
            <div className="text-3xl mb-3">⚙️</div>
            <h2 className="text-xl font-bold mb-2">Ayarlar</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sistem ayarları ve kullanıcı yönetimi
            </p>
            <Button size="sm" className="w-full" variant="ghost" disabled>Yakında</Button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="font-semibold mb-4">Hızlı İstatistikler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Bugünkü Satış</p>
              <p className="text-2xl font-bold">₺{loading ? '-' : stats.sales}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif Ürün</p>
              <p className="text-2xl font-bold">{loading ? '-' : stats.products}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personel</p>
              <p className="text-2xl font-bold">{loading ? '-' : stats.personnel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Şube</p>
              <p className="text-2xl font-bold">{loading ? '-' : stats.branches}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
