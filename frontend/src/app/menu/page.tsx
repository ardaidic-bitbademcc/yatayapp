// @ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from './hooks';

export default function MenuPage() {
  const { data: products = [], isLoading: loading, error: fetchError } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [form, setForm] = useState({ name: '', price: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const error = fetchError?.message || createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message;
  const formLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { name: form.name, price: Number(form.price) };
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, ...productData });
      setEditId(null);
    } else {
      await createMutation.mutateAsync(productData);
    }
    setForm({ name: '', price: '' });
  };

  const handleEdit = (product: any) => {
    setForm({ name: product.name, price: String(product.price) });
    setEditId(product.id);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Menü Mühendisliği</h1>
        <p className="text-muted-foreground">Menü optimizasyonu ve AI analizi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg p-4 col-span-4">
          <h3 className="font-semibold mb-2">Menü Listesi</h3>
          <p className="text-sm text-muted-foreground mb-4">Tüm menü öğeleri</p>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2">
              {products.map(product => (
                <li key={product.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">₺{product.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Sil</Button>
                  </div>
                </li>
              ))}
              {products.length === 0 && <li className="text-xs text-muted-foreground">Hiç ürün bulunamadı.</li>}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ürün adı"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Fiyat"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>
              {editId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editId && (
              <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => { setEditId(null); setForm({ name: '', price: '' }); }}>
                İptal
              </Button>
            )}
          </form>
        </div>
        {/* ...diğer kutular... */}
      </div>

      <Link href="/">
        <Button variant="ghost">← Ana Sayfa</Button>
      </Link>
    </div>
  );
}

