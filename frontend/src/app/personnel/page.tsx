// @ts-nocheck

'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePersonnel, useCreatePersonnel, useUpdatePersonnel, useDeletePersonnel } from './hooks';

export default function PersonnelPage() {
  const { data: personnel = [], isLoading: loading, error: fetchError } = usePersonnel();
  const createMutation = useCreatePersonnel();
  const updateMutation = useUpdatePersonnel();
  const deleteMutation = useDeletePersonnel();

  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '' });
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
  setForm({ name: '', role: '', email: '', phone: '' });
  };

  const handleEdit = (person: any) => {
    setForm({ name: person.name, role: person.role, email: person.email || '', phone: person.phone || '' });
    setEditId(person.id);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Personel Yönetimi</h1>
        <p className="text-muted-foreground">Vardiya, puantaj ve maaş yönetimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg p-4 col-span-4">
          <h3 className="font-semibold mb-2">Personel Listesi</h3>
          <p className="text-sm text-muted-foreground mb-4">Tüm personelleri görüntüle</p>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2">
              {personnel.map(p => (
                <li key={p.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.role}</span>
                    {p.email && <span className="ml-2 text-xs text-muted-foreground">| {p.email}</span>}
                    {p.phone && <span className="ml-2 text-xs text-muted-foreground">| {p.phone}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Sil</Button>
                  </div>
                </li>
              ))}
              {personnel.length === 0 && <li className="text-xs text-muted-foreground">Hiç personel bulunamadı.</li>}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Personel adı"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-posta"
              className="border rounded px-2 py-1 w-full"
              disabled={formLoading}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Telefon"
              className="border rounded px-2 py-1 w-full"
              disabled={formLoading}
            />
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Rol (ör: cashier, staff, chef)"
              className="border rounded px-2 py-1 w-full"
              required
              disabled={formLoading}
            />
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>
              {editId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editId && (
              <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => { setEditId(null); setForm({ name: '', role: '', email: '', phone: '' }); }}>
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

