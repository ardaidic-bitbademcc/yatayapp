"use client";
// @ts-nocheck

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSalesReport } from './hooks';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const { data: salesData = [], isLoading } = useSalesReport(dateRange);

  // KPI hesaplamaları
  const kpis = useMemo(() => {
    const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
    const totalOrders = salesData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Ödeme yöntemi dağılımı (tutar ve yüzde)
    const paymentMethodBreakdown: Record<string, { amount: number; pct: number }> = {};
    salesData.forEach(s => {
      const method = s.payment_method || 'unknown';
      const amt = Number(s.total_amount || 0);
      paymentMethodBreakdown[method] = {
        amount: (paymentMethodBreakdown[method]?.amount || 0) + amt,
        pct: 0
      };
    });
    Object.keys(paymentMethodBreakdown).forEach(k => {
      paymentMethodBreakdown[k].pct = totalRevenue > 0 ? (paymentMethodBreakdown[k].amount / totalRevenue) * 100 : 0;
    });

    // Ürün bazlı konsolidasyon
    const productMap: Record<string, { qty: number; revenue: number }> = {};
    salesData.forEach(s => {
      const name = s.product_name || 'Bilinmeyen';
      const amt = Number(s.total_amount || 0);
      productMap[name] = {
        qty: (productMap[name]?.qty || 0) + (s.quantity || 1),
        revenue: (productMap[name]?.revenue || 0) + amt
      };
    });
    const topProducts = Object.entries(productMap)
      .sort((a,b)=>b[1].revenue - a[1].revenue)
      .slice(0,10);

    // Saat bazlı gelir (hour of day)
    const hourBuckets: Record<string, number> = {};
    salesData.forEach(s => {
      const d = new Date(s.created_at);
      const hour = d.getHours().toString().padStart(2,'0');
      hourBuckets[hour] = (hourBuckets[hour] || 0) + Number(s.total_amount || 0);
    });
    const hourly = Object.entries(hourBuckets)
      .sort((a,b)=>Number(a[0]) - Number(b[0]));

    return { totalRevenue, totalOrders, avgOrderValue, paymentMethodBreakdown, topProducts, hourly };
  }, [salesData]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Raporlar</h1>
          <p className="text-muted-foreground">Satış, ödeme ve performans raporları</p>
        </div>
        <Link href="/">
          <Button variant="ghost">← Ana Sayfa</Button>
        </Link>
      </div>

      {/* Tarih Aralığı Filtreleme */}
      <div className="mb-6 flex gap-2">
        <Button 
          size="sm" 
          variant={dateRange === 'today' ? 'default' : 'outline'}
          onClick={() => setDateRange('today')}
        >
          Bugün
        </Button>
        <Button 
          size="sm" 
          variant={dateRange === 'week' ? 'default' : 'outline'}
          onClick={() => setDateRange('week')}
        >
          Bu Hafta
        </Button>
        <Button 
          size="sm" 
          variant={dateRange === 'month' ? 'default' : 'outline'}
          onClick={() => setDateRange('month')}
        >
          Bu Ay
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Yükleniyor...</div>
      ) : (
        <>
          {/* KPI Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-1">Toplam Gelir</div>
              <div className="text-3xl font-bold text-green-700">₺{kpis.totalRevenue.toFixed(2)}</div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-1">Toplam Sipariş</div>
              <div className="text-3xl font-bold text-blue-700">{kpis.totalOrders}</div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-1">Ortalama Sipariş Değeri</div>
              <div className="text-3xl font-bold text-purple-700">₺{kpis.avgOrderValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Ödeme Yöntemi Dağılımı */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Ödeme Yöntemi Dağılımı</h2>
              {Object.keys(kpis.paymentMethodBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">Veri yok</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(kpis.paymentMethodBreakdown).map(([method, data]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{method}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">₺{data.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{data.pct.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Saat Bazlı Gelir */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Saat Bazlı Gelir</h2>
              {kpis.hourly.length === 0 ? (
                <p className="text-sm text-muted-foreground">Veri yok</p>
              ) : (
                <div className="space-y-2">
                  {kpis.hourly.map(([hour, revenue]) => (
                    <div key={hour} className="flex items-center gap-2">
                      <span className="w-10 text-xs font-medium">{hour}:00</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${kpis.totalRevenue ? (revenue / kpis.totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs">₺{Number(revenue).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Ürünler */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">En Çok Satan Ürünler</h2>
            {kpis.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Veri yok</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Ürün</th>
                      <th className="text-right py-2 px-3">Adet</th>
                      <th className="text-right py-2 px-3">Ciro</th>
                      <th className="text-right py-2 px-3">Pay %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.topProducts.map(([name, info]) => (
                      <tr key={name} className="border-b last:border-b-0">
                        <td className="py-2 px-3 font-medium">{name}</td>
                        <td className="py-2 px-3 text-right">{info.qty}</td>
                        <td className="py-2 px-3 text-right">₺{info.revenue.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">{(kpis.totalRevenue ? (info.revenue / kpis.totalRevenue) * 100 : 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Son Satışlar Tablosu */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Son Satışlar</h2>
            {salesData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Satış bulunamadı</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Tarih</th>
                      <th className="text-left py-2 px-3">Ürün</th>
                      <th className="text-right py-2 px-3">Miktar</th>
                      <th className="text-right py-2 px-3">Tutar</th>
                      <th className="text-left py-2 px-3">Ödeme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale) => (
                      <tr key={sale.id} className="border-b last:border-b-0">
                        <td className="py-2 px-3">
                          {new Date(sale.created_at).toLocaleDateString('tr-TR', { 
                            day: '2-digit', 
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2 px-3">{sale.product_name || '-'}</td>
                        <td className="py-2 px-3 text-right">{sale.quantity || 1}</td>
                        <td className="py-2 px-3 text-right font-medium">₺{Number(sale.total_amount || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 capitalize">{sale.payment_method || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
