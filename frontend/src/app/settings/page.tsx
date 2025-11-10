"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarları ve yönetim araçları</p>
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
              <Link href="/api/admin/set-pin">
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
