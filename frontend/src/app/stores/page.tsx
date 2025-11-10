"use client";
// @ts-nocheck

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from './hooks';

export default function StoresPage() {
  const { data: stores = [], isLoading: loading, error: fetchError } = useStores();
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  const deleteMutation = useDeleteStore();

  const [form, setForm] = useState({ store_code: '', name: '', address: '', phone: '', email: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const error = fetchError?.message || createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message;
  const formLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, ...form });
      setEditId(null);
    } else {
      await createMutation.mutateAsync(form);
    }
    setForm({ store_code: '', name: '', address: '', phone: '', email: '' });
  };

  const handleEdit = (store: any) => {
    setForm({ 
      store_code: store.store_code || '', 
      name: store.name, 
      address: store.address || '', 
      phone: store.phone || '', 
      email: store.email || '' 
    });
    setEditId(store.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mağazayı silmek istediğinize emin misiniz?')) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mağaza Yönetimi</h1>
          <p className="text-muted-foreground">Mağaza oluşturma, düzenleme ve yönetim</p>
        </div>
        <Link href="/">
          <Button variant="ghost">← Ana Sayfa</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mağaza Listesi */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Mağazalar</h3>
          <p className="text-sm text-muted-foreground mb-4">Tüm mağazaları görüntüle ve yönet</p>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2 space-y-2">
              {stores.map(s => (
                <li key={s.id} className="py-2 border-b last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Kod: {s.store_code}</div>
                      {s.address && <div className="text-xs text-muted-foreground">{s.address}</div>}
                      {s.phone && <div className="text-xs text-muted-foreground">Tel: {s.phone}</div>}
                      {s.email && <div className="text-xs text-muted-foreground">E-posta: {s.email}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>Düzenle</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Sil</Button>
                    </div>
                  </div>
                </li>
              ))}
              {stores.length === 0 && <li className="text-xs text-muted-foreground">Hiç mağaza bulunamadı.</li>}
            </ul>
          )}
        </div>

        {/* Mağaza Ekleme/Düzenleme Formu */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{editId ? 'Mağaza Düzenle' : 'Yeni Mağaza Ekle'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Mağaza Kodu *</label>
              <input
                name="store_code"
                value={form.store_code}
                onChange={handleChange}
                placeholder="ör: 2131"
                className="border rounded px-2 py-1 w-full mt-1"
                required
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mağaza Adı *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mağaza adı"
                className="border rounded px-2 py-1 w-full mt-1"
                required
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adres</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Adres"
                className="border rounded px-2 py-1 w-full mt-1"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Telefon"
                className="border rounded px-2 py-1 w-full mt-1"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">E-posta</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-posta"
                className="border rounded px-2 py-1 w-full mt-1"
                disabled={formLoading}
              />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>
              {editId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editId && (
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="w-full" 
                onClick={() => { 
                  setEditId(null); 
                  setForm({ store_code: '', name: '', address: '', phone: '', email: '' }); 
                }}
              >
                İptal
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
