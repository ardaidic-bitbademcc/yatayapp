"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarları ve yönetim araçları</p>
        <div className="mt-3">
          <Link href="/">
            <Button variant="ghost" size="sm">← Ana sayfa</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Admin Araçları */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Araçları</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-medium">Personel PIN Ayarla</h3>
                <p className="text-sm text-muted-foreground">Personel giriş/çıkış için PIN oluştur</p>
              </div>
              <Link href="/settings/pin">
                <Button variant="outline" size="sm">Yönet</Button>
              </Link>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-medium">Demo Veri</h3>
                <p className="text-sm text-muted-foreground">Test verileri oluştur/sıfırla</p>
              </div>
              <Button variant="outline" size="sm" disabled>Yakında</Button>
            </div>
          </div>
        </div>

  {/* POS - Ödeme Yöntemleri */}
  <PaymentMethodsSettings />

  {/* POS - Masa Yönetimi */}
  <TableManagementSettings />

        {/* Sistem Bilgileri */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Sistem Bilgileri</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versiyon:</span>
              <span className="font-medium">0.0.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Demo Mod:</span>
              <span className="font-medium">{process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'Aktif' : 'Pasif'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function PaymentMethodsSettings() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', color: '#2563eb', sort_order: 0, active: true });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('payment_methods').select('*').order('sort_order');
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('payment_methods').insert([form]);
    setForm({ name: '', color: '#2563eb', sort_order: 0, active: true });
    await load();
    setLoading(false);
  };
  const toggle = async (pm: any) => {
    await supabase.from('payment_methods').update({ active: !pm.active }).eq('id', pm.id);
    await load();
  };
  const remove = async (id: string) => {
    await supabase.from('payment_methods').delete().eq('id', id);
    await load();
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">POS - Ödeme Yöntemleri</h2>
      <form onSubmit={add} className="flex flex-wrap gap-2 mb-4">
        <input value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} placeholder="isim (örn: cash)" className="border rounded px-2 py-1" required />
        <input type="color" value={form.color} onChange={e=>setForm(f=>({ ...f, color: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="number" value={form.sort_order} onChange={e=>setForm(f=>({ ...f, sort_order: Number(e.target.value) }))} className="border rounded px-2 py-1 w-24" placeholder="sıra" />
        <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({ ...f, active: e.target.checked }))} /> aktif</label>
        <Button type="submit" size="sm" disabled={loading}>Ekle</Button>
      </form>
      <ul className="divide-y">
        {list.map(pm => (
          <li key={pm.id} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pm.color }} />
              <span className="font-medium">{pm.name}</span>
              <span className="text-xs text-muted-foreground">(sıra: {pm.sort_order})</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={()=>toggle(pm)}>{pm.active ? 'Pasifleştir' : 'Aktifleştir'}</Button>
              <Button size="sm" variant="destructive" onClick={()=>remove(pm.id)}>Sil</Button>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="py-2 text-sm text-muted-foreground">Kayıt yok</li>}
      </ul>
    </div>
  );
}

function TableManagementSettings() {
  const [zones, setZones] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [zoneForm, setZoneForm] = useState({ name: '' });
  const [tableForm, setTableForm] = useState({ name: '', capacity: 4 });
  const [bulk, setBulk] = useState({ prefix: 'M', start: 1, count: 10, capacity: 4 });
  const [selectedZone, setSelectedZone] = useState<string | undefined>(undefined);

  const loadZones = async () => {
    const { data } = await supabase.from('table_zones').select('*').order('sort_order').order('name');
    setZones(data || []);
  };
  const loadTables = async (zoneId?: string) => {
    let q = supabase.from('tables').select('*');
    if (zoneId) q = q.eq('zone_id', zoneId);
    const { data } = await q.order('name');
    setTables(data || []);
  };
  useEffect(() => { loadZones(); }, []);
  useEffect(() => { loadTables(selectedZone); }, [selectedZone]);

  const addZone = async (e: any) => {
    e.preventDefault();
    await supabase.from('table_zones').insert([{ name: zoneForm.name }]);
    setZoneForm({ name: '' });
    await loadZones();
  };
  const rmZone = async (id: string) => {
    await supabase.from('table_zones').delete().eq('id', id);
    if (selectedZone === id) setSelectedZone(undefined);
    await loadZones();
    await loadTables(selectedZone);
  };

  const addTable = async (e: any) => {
    e.preventDefault();
    if (!selectedZone) return;
    await supabase.from('tables').insert([{ name: tableForm.name, capacity: tableForm.capacity, zone_id: selectedZone }]);
    setTableForm({ name: '', capacity: 4 });
    await loadTables(selectedZone);
  };
  const addBulkTables = async (e: any) => {
    e.preventDefault();
    if (!selectedZone) return;
    const rows = Array.from({ length: Math.max(0, Number(bulk.count) || 0) }).map((_, i) => ({
      name: `${bulk.prefix}${Number(bulk.start) + i}`,
      capacity: Number(bulk.capacity) || 4,
      zone_id: selectedZone
    }));
    if (rows.length === 0) return;
    await supabase.from('tables').insert(rows);
    await loadTables(selectedZone);
  };
  const rmTable = async (id: string) => {
    await supabase.from('tables').delete().eq('id', id);
    await loadTables(selectedZone);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">POS - Masa Yönetimi</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Bölgeler</h3>
          <form onSubmit={addZone} className="flex gap-2 mb-3">
            <input value={zoneForm.name} onChange={e=>setZoneForm({ name: e.target.value })} placeholder="Bölge adı" className="border rounded px-2 py-1 w-full" required />
            <Button type="submit" size="sm">Ekle</Button>
          </form>
          <ul className="space-y-1">
            {zones.map(z => (
              <li key={z.id} className="flex items-center justify-between">
                <button className={`text-left flex-1 ${selectedZone === z.id ? 'font-semibold' : ''}`} onClick={()=>setSelectedZone(z.id)}>{z.name}</button>
                <Button size="sm" variant="destructive" onClick={()=>rmZone(z.id)}>Sil</Button>
              </li>
            ))}
            {zones.length === 0 && <li className="text-sm text-muted-foreground">Bölge yok</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Masalar {selectedZone ? '' : '(bölge seçin)'}</h3>
          <form onSubmit={addTable} className="flex gap-2 mb-3">
            <input value={tableForm.name} onChange={e=>setTableForm(f=>({ ...f, name: e.target.value }))} placeholder="Masa adı" className="border rounded px-2 py-1 w-full" required disabled={!selectedZone} />
            <input type="number" value={tableForm.capacity} onChange={e=>setTableForm(f=>({ ...f, capacity: Number(e.target.value) }))} className="border rounded px-2 py-1 w-24" placeholder="Kişi" disabled={!selectedZone} />
            <Button type="submit" size="sm" disabled={!selectedZone}>Ekle</Button>
          </form>
          <form onSubmit={addBulkTables} className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="text-xs text-muted-foreground">Toplu ekle:</span>
            <input value={bulk.prefix} onChange={e=>setBulk(b=>({ ...b, prefix: e.target.value }))} placeholder="Önek" className="border rounded px-2 py-1 w-24" disabled={!selectedZone} />
            <input type="number" value={bulk.start} onChange={e=>setBulk(b=>({ ...b, start: Number(e.target.value) }))} placeholder="Başlangıç" className="border rounded px-2 py-1 w-28" disabled={!selectedZone} />
            <input type="number" value={bulk.count} onChange={e=>setBulk(b=>({ ...b, count: Number(e.target.value) }))} placeholder="Adet" className="border rounded px-2 py-1 w-24" disabled={!selectedZone} />
            <input type="number" value={bulk.capacity} onChange={e=>setBulk(b=>({ ...b, capacity: Number(e.target.value) }))} placeholder="Kişi" className="border rounded px-2 py-1 w-24" disabled={!selectedZone} />
            <Button type="submit" size="sm" variant="outline" disabled={!selectedZone}>Toplu Oluştur</Button>
          </form>
          <ul className="space-y-1">
            {tables.map(t => (
              <li key={t.id} className="flex items-center justify-between">
                <span>{t.name} <span className="text-xs text-muted-foreground">({t.capacity || 0})</span></span>
                <Button size="sm" variant="destructive" onClick={()=>rmTable(t.id)}>Sil</Button>
              </li>
            ))}
            {tables.length === 0 && <li className="text-sm text-muted-foreground">Masa yok</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
