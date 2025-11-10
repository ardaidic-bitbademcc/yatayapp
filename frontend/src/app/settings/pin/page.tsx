"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PinSettingsPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [personnelId, setPersonnelId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('personnel').select('id,name,employee_id').order('name');
      setPersonnel(data || []);
    })();
  }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, pin })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'İşlem başarısız');
      setMessage('✅ PIN başarıyla ayarlandı');
      setPersonnelId('');
      setPin('');
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PIN Yönetimi</h1>
        <Link href="/settings">
          <Button variant="ghost" size="sm">← Ayarlara dön</Button>
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <select value={personnelId} onChange={e=>setPersonnelId(e.target.value)} className="border rounded px-3 py-2 w-full" required>
          <option value="">Personel seçiniz</option>
          {personnel.map(p => (
            <option key={p.id} value={p.id}>{p.employee_id ? `${p.employee_id} - ` : ''}{p.name}</option>
          ))}
        </select>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} maxLength={4} placeholder="4 haneli PIN" className="border rounded px-3 py-2 w-full" required />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Kaydediliyor...' : 'PIN Kaydet'}</Button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
