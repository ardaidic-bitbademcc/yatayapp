// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import * as Sentry from '@sentry/nextjs';
import AttendanceWidget from '@/components/AttendanceWidget';

export default function HomePage() {
  const [stats, setStats] = useState({ 
    sales: 0, 
    products: 0, 
    personnel: 0, 
    branches: 0, 
    totalAmount: 0,
    todayOrders: 0,
    openTables: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

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
      
      // Bugünün başlangıcı
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        salesRes, 
        productsRes, 
        personnelRes, 
        branchesRes, 
        totalRes, 
        recentRes,
        todayOrdersRes,
        openTablesRes,
        todaySalesRes
      ] = await Promise.all([
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('personnel').select('*', { count: 'exact', head: true }),
        supabase.from('branches').select('*', { count: 'exact', head: true }),
        supabase.from('sales').select('amount,total_amount'),
        supabase.from('sales').select('created_at,amount,total_amount,product_name,description').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('sales').select('total_amount').gte('created_at', today.toISOString())
      ]);
      
      const totalAmount = (totalRes.data || []).reduce((sum, s) => sum + Number(s.total_amount || s.amount || 0), 0);
      const todayRevenue = (todaySalesRes.data || []).reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      
      setStats({
        sales: salesRes.count ?? 0,
        products: productsRes.count ?? 0,
        personnel: personnelRes.count ?? 0,
        branches: branchesRes.count ?? 0,
        totalAmount,
        todayOrders: todayOrdersRes.count ?? 0,
        openTables: openTablesRes.count ?? 0,
        todayRevenue
      });
      setRecentSales(recentRes.data || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8" role="heading" aria-level={1}>YatayApp</h1>

        {/* KPI Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-indigo-700">{stats.sales}</div>
            <div className="text-xs text-neutral-500 mt-2">Toplam Satış</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{stats.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
            <div className="text-xs text-neutral-500 mt-2">Toplam Ciro</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-700">{stats.todayOrders}</div>
            <div className="text-xs text-neutral-500 mt-2">Bugünkü Sipariş</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-cyan-700">{stats.openTables}</div>
            <div className="text-xs text-neutral-500 mt-2">Açık Masa</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-emerald-700">{stats.todayRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
            <div className="text-xs text-neutral-500 mt-2">Bugünkü Ciro</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700">{stats.personnel}</div>
            <div className="text-xs text-neutral-500 mt-2">Personel</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-700">{stats.products}</div>
            <div className="text-xs text-neutral-500 mt-2">Ürün</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-pink-700">{stats.branches}</div>
            <div className="text-xs text-neutral-500 mt-2">Şube</div>
          </div>
        </div>

        {/* Giriş-Çıkış Widget */}
        <div className="mb-8">
          <AttendanceWidget />
        </div>

        {/* Son Satışlar Tablosu */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Son Satışlar</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Tarih</th>
                <th className="py-2 text-left">Ürün</th>
                <th className="py-2 text-right">Tutar</th>
                <th className="py-2 text-left">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center text-neutral-400">Kayıt yok</td></tr>
              ) : recentSales.map(sale => (
                <tr key={sale.created_at} className="border-b">
                  <td className="py-2">{new Date(sale.created_at).toLocaleString('tr-TR')}</td>
                  <td className="py-2">{sale.product_name}</td>
                  <td className="py-2 text-right">{Number(sale.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                  <td className="py-2">{sale.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {process.env.NEXT_PUBLIC_SENTRY_DSN && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 mb-2">Sentry aktif (geliştirme/test modu)</p>
            <Button size="sm" variant="outline" onClick={testSentryError}>
              🐛 Hata Testi (Sentry)
            </Button>
          </div>
        )}

        {/* Modül Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <Link href="/reports">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">📊</div>
              <h2 className="text-xl font-bold mb-2">Raporlar</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Satış, ödeme ve performans raporları
              </p>
              <Button size="sm" className="w-full" variant="outline">Görüntüle →</Button>
            </div>
          </Link>
          <Link href="/settings">
            <div className="bg-white border-2 border-transparent hover:border-primary rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="text-3xl mb-3">⚙️</div>
              <h2 className="text-xl font-bold mb-2">Ayarlar</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sistem ayarları ve kullanıcı yönetimi
              </p>
              <Button size="sm" className="w-full" variant="outline">Yönet →</Button>
            </div>
          </Link>
        </div>

        {/* Hızlı İstatistikler */}
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
