// @ts-nocheck
"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProducts } from '../menu/hooks';
import {
  useZones,
  useTables,
  useEnsureOpenOrder,
  useOrderItems,
  useAddItem,
  useUpdateItemQty,
  useRemoveItem,
  usePaymentMethods,
  usePayAndClose,
} from './hooks';

export default function PosPage() {
  const { data: products = [] } = useProducts();
  const { data: zones = [] } = useZones();
  const [zoneId, setZoneId] = useState<string | undefined>(undefined);
  const { data: tables = [] } = useTables(zoneId);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const ensureOrder = useEnsureOpenOrder();
  const [order, setOrder] = useState<any | null>(null);
  const addItem = useAddItem();
  const updateQty = useUpdateItemQty();
  const removeItem = useRemoveItem();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const payAndClose = usePayAndClose();

  const { data: items = [] } = useOrderItems(order?.id);
  const total = useMemo(() => items.reduce((s, it) => s + Number(it.line_total || 0), 0), [items]);

  const onSelectTable = async (t: any) => {
    setSelectedTable(t);
    const ord = await ensureOrder.mutateAsync(t.id);
    setOrder(ord);
  };

  const onAddProduct = async (p: any) => {
    if (!order) return;
    await addItem.mutateAsync({ order_id: order.id, product: p });
  };

  const onPay = async (method: any) => {
    if (!order || !selectedTable) return;
    await payAndClose.mutateAsync({ order_id: order.id, method: method.name, amount: total, table_id: selectedTable.id });
    setOrder(null);
    setSelectedTable(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Masa POS</h1>
        <p className="text-muted-foreground">Masaya ürün ekle, sepeti yönet ve ödeme al</p>
      </div>

      {/* Bölge Seçimi */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={zoneId ? 'outline' : 'default'} onClick={() => setZoneId(undefined)}>Tümü</Button>
        {zones.map(z => (
          <Button key={z.id} size="sm" variant={zoneId === z.id ? 'default' : 'outline'} onClick={() => setZoneId(z.id)}>{z.name}</Button>
        ))}
  {zones.length === 0 && <span className="text-xs text-muted-foreground">Bölge yok. Ayarlar {'>'} Masa Yönetimi</span>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Masalar */}
        <div className="xl:col-span-1">
          <div className="grid grid-cols-3 gap-3">
            {tables.map((t: any) => (
              <button key={t.id}
                onClick={() => onSelectTable(t)}
                className={`p-4 rounded-lg border text-center font-semibold shadow-sm hover:shadow transition ${t.status === 'occupied' ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                {t.name}
              </button>
            ))}
            {tables.length === 0 && <div className="text-xs text-muted-foreground">Bu bölgede masa yok.</div>}
          </div>
        </div>

        {/* Ürünler */}
        <div className="xl:col-span-1 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {products.map(p => (
              <button key={p.id} onClick={() => onAddProduct(p)} className="p-3 rounded border hover:bg-slate-50">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">₺{p.price}</div>
              </button>
            ))}
            {products.length === 0 && <div className="text-xs text-muted-foreground">Ürün yok (Menu modülü).</div>}
          </div>
        </div>

        {/* Sepet/Ödeme */}
        <div className="xl:col-span-1 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">{selectedTable ? `${selectedTable.name} Sipariş` : 'Sepet'}</h2>
          {!selectedTable && (
            <div className="text-sm text-muted-foreground">Masa seçiniz.</div>
          )}
          {selectedTable && (
            <div>
              <ul className="divide-y">
                {items.map((it: any) => (
                  <li key={it.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{it.product_name}</div>
                      <div className="text-xs text-muted-foreground">₺{it.unit_price} x {it.quantity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => updateQty.mutate({ id: it.id, quantity: Math.max(1, it.quantity - 1), order_id: order.id })}>-</Button>
                      <span className="w-6 text-center text-sm">{it.quantity}</span>
                      <Button size="icon" variant="outline" onClick={() => updateQty.mutate({ id: it.id, quantity: it.quantity + 1, order_id: order.id })}>+</Button>
                      <Button size="icon" variant="destructive" onClick={() => removeItem.mutate({ id: it.id, order_id: order.id })}>✕</Button>
                    </div>
                  </li>
                ))}
                {items.length === 0 && <li className="py-6 text-sm text-muted-foreground">Sepet boş</li>}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Toplam</div>
                <div className="text-xl font-bold">{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {paymentMethods.map(pm => (
                  <Button key={pm.id} style={{ backgroundColor: pm.color || undefined }} onClick={() => onPay(pm)} disabled={items.length === 0}>
                    {pm.name}
                  </Button>
                ))}
                {paymentMethods.length === 0 && <div className="text-xs text-muted-foreground">Ödeme yöntemi yok. Ayarlar {'>'} Ödeme Yöntemleri</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/">
          <Button variant="ghost">← Ana Sayfa</Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline">Ayarlar</Button>
        </Link>
      </div>
    </div>
  );
}

