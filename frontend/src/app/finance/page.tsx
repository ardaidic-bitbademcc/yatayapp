// @ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useIncomeRecords, useCreateIncomeRecord, useUpdateIncomeRecord, useDeleteIncomeRecord } from './hooks';

export default function FinancePage() {
  const { data: records = [], isLoading: loading, error: fetchError } = useIncomeRecords();
  const createMutation = useCreateIncomeRecord();
  const updateMutation = useUpdateIncomeRecord();
  const deleteMutation = useDeleteIncomeRecord();

  const [form, setForm] = useState({ type: 'income', amount: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const error = fetchError?.message || createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message;
  const formLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recordData = { type: form.type as 'income' | 'expense', amount: Number(form.amount), description: form.description };
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, ...recordData });
      setEditId(null);
    } else {
      await createMutation.mutateAsync(recordData);
    }
    setForm({ type: 'income', amount: '', description: '' });
  };

  const handleEdit = (record: any) => {
    setForm({ type: record.type, amount: String(record.amount), description: record.description || '' });
    setEditId(record.id);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Finans Yönetimi</h1>
        <p className="text-muted-foreground">Gelir-gider takibi ve finansal raporlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4 col-span-2">
          <h3 className="font-semibold mb-2">Gelir-Gider Takibi</h3>
          <p className="text-sm text-muted-foreground mb-4">Günlük hareketler</p>
          {loading ? (
            <div className="text-sm">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Hata: {error}</div>
          ) : (
            <ul className="mb-2">
              {records.map(rec => (
                <li key={rec.id} className="py-1 border-b last:border-b-0 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{rec.type === 'income' ? 'Gelir' : 'Gider'}:</span>
                    <span className="ml-2 text-xs text-muted-foreground">₺{rec.amount}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{rec.description}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(rec)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(rec.id)}>Sil</Button>
                  </div>
                </li>
              ))}
              {records.length === 0 && <li className="text-xs text-muted-foreground">Hiç kayıt yok.</li>}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={formLoading}>
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </select>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Tutar" className="border rounded px-2 py-1 w-full" required disabled={formLoading} />
            <input name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="border rounded px-2 py-1 w-full" required disabled={formLoading} />
            <Button type="submit" size="sm" className="w-full" disabled={formLoading}>
              {editId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editId && (
              <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => { setEditId(null); setForm({ type: 'income', amount: '', description: '' }); }}>
                İptal
              </Button>
            )}
          </form>
        </div>
      </div>

      <Link href="/">
        <Button variant="ghost">← Ana Sayfa</Button>
      </Link>
    </div>
  );
}

