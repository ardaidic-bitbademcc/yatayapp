// @ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProducts } from '../menu/hooks';
import { useSales, useCreateSale, useDeleteSale } from './hooks';

export default function PosPage() {
  const { data: products = [] } = useProducts();
  const { data: sales = [], isLoading: loading, error: fetchError } = useSales();
  const createMutation = useCreateSale();
  const deleteMutation = useDeleteSale();

  const [form, setForm] = useState({ product_id: '', quantity: 1 });

  const error = fetchError?.message || createMutation.error?.message || deleteMutation.error?.message;
  const formLoading = createMutation.isPending || deleteMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === Number(form.product_id));
    const saleData = {
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
      total: product ? product.price * Number(form.quantity) : 0
    };
    await createMutation.mutateAsync(saleData);
    setForm({ product_id: '', quantity: 1 });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Satış Ekranı (POS)</h1>
        <p className="text-muted-foreground">Hızlı satış işlemleri için POS modülü</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Ürün Listesi</h2>
          <ul className="mb-2">
            {products.map(product => (
              <li key={product.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                <span>{product.name} <span className="ml-2 text-xs text-muted-foreground">₺{product.price}</span></span>
              </li>
            ))}
            {products.length === 0 && <li className="text-xs text-muted-foreground">Hiç ürün yok.</li>}
          </ul>
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <select name="product_id" value={form.product_id} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={formLoading}>
              <option value="">Ürün seçiniz</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={formLoading} />
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>Satış Ekle</Button>
          </form>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Satışlar</h2>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2">
              {sales.map(sale => (
                <li key={sale.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                  <span>Ürün ID: {sale.product_id} - Adet: {sale.quantity}</span>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(sale.id)}>Sil</Button>
                </li>
              ))}
              {sales.length === 0 && <li className="text-xs text-muted-foreground">Hiç satış yok.</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/">
          <Button variant="ghost">← Ana Sayfa</Button>
        </Link>
      </div>
    </div>
  );
}

