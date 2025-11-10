"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AttendanceWidget() {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'id' | 'pin'>('id');

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = mode === 'id' 
        ? { method: 'employee_id', employee_id: employeeId }
        : { method: 'pin', pin };

      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'İşlem başarısız');

      if (json.action === 'checkin') {
        setMessage(`✅ Giriş başarılı!`);
      } else if (json.action === 'checkout') {
        setMessage(`✅ Çıkış başarılı! Çalışma süresi: ${json.duration_hours} saat`);
      }

      // Formu temizle
      setEmployeeId('');
      setPin('');
    } catch (err: any) {
      setMessage('❌ Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="font-semibold mb-4 text-lg">⏰ Personel Giriş/Çıkış</h3>

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={mode === 'id' ? 'default' : 'outline'}
          onClick={() => setMode('id')}
        >
          Personel ID
        </Button>
        <Button
          size="sm"
          variant={mode === 'pin' ? 'default' : 'outline'}
          onClick={() => setMode('pin')}
        >
          PIN
        </Button>
      </div>

      <form onSubmit={handleCheckIn} className="space-y-3">
        {mode === 'id' ? (
          <input
            type="text"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            placeholder="Personel ID (örn: P001)"
            className="w-full px-3 py-2 border rounded text-sm"
            required
          />
        ) : (
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="4 haneli PIN"
            className="w-full px-3 py-2 border rounded text-sm"
            maxLength={4}
            required
          />
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'İşleniyor...' : 'Giriş/Çıkış Yap'}
        </Button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
