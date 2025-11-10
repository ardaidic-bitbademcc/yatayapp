"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import QRCode from 'qrcode.react';

export default function AttendancePage() {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple PIN-based check-in (MVP): client posts PIN and personnel id is resolved server-side
  const handlePin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'pin', pin })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Check-in failed');
      setMessage('Giriş başarılı');
    } catch (err:any) {
      setMessage('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // QR kodu göster (cihaz/terminalde okutulacak)
  const qrPayload = JSON.stringify({ action: 'checkin', ts: Date.now() });

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Personel Giriş / Çıkış</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">PIN ile Giriş</h2>
        <form onSubmit={handlePin} className="space-y-2">
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="4 haneli PIN" className="w-full px-3 py-2 border rounded" />
          <button className="w-full bg-indigo-600 text-white px-3 py-2 rounded" disabled={loading}>{loading ? '...' : 'Giriş Yap'}</button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">QR ile Giriş (cihazda okutun)</h2>
        <div className="p-4 bg-white rounded inline-block">
          <QRCode value={qrPayload} size={180} />
        </div>
      </div>

      {message && <div className="mt-4 p-3 bg-neutral-100 rounded">{message}</div>}
    </div>
  );
}
