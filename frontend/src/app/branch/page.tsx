// @ts-nocheck

'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from './hooks';

export default function BranchPage() {
  const { data: branches = [], isLoading: loading, error: fetchError } = useBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();

  const [form, setForm] = useState({ name: '', address: '' });
  const [editId, setEditId] = useState<number | null>(null);

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
    setForm({ name: '', address: '' });
  };

  const handleEdit = (branch: any) => {
    setForm({ name: branch.name, address: branch.address });
    setEditId(branch.id);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Şube Yönetimi</h1>
        <p className="text-muted-foreground">Çoklu şube yönetimi ve merkezi ürün kontrolü</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Şube Listesi</h3>
          <p className="text-sm text-muted-foreground mb-4">Tüm şubeleri görüntüle</p>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2">
              {branches.map(branch => (
                <li key={branch.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{branch.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{branch.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(branch)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(branch.id)}>Sil</Button>
                  </div>
                </li>
              ))}
              {branches.length === 0 && <li className="text-xs text-muted-foreground">Hiç şube bulunamadı.</li>}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Şube adı"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Adres"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>
              {editId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editId && (
              <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => { setEditId(null); setForm({ name: '', address: '' }); }}>
                İptal
              </Button>
            )}
          </form>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Merkezi Ürün Yönetimi</h3>
          <p className="text-sm text-muted-foreground mb-4">Toplu ürün güncelleme</p>
          <Button size="sm" variant="outline" className="w-full">Yönet</Button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Performans Karşılaştırma</h3>
          <p className="text-sm text-muted-foreground mb-4">Şube performans analizi</p>
          <Button size="sm" variant="outline" className="w-full">Analiz Et</Button>
        </div>
      </div>

      <Link href="/">
        <Button variant="ghost">← Ana Sayfa</Button>
      </Link>
    </div>
  );
}

