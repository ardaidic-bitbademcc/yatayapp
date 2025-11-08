"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setInfo("Giriş linki e-posta adresinize gönderildi.");
    setLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Demo modunda kullanıcı yoksa bilgilendir
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        setError("Giriş başarısız. Demo kullanıcı henüz yok olabilir. Lütfen demo kurulumunu çalıştırın.");
      } else {
        setError(error.message);
      }
    } else if (data.session) {
      router.push(redirect);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Giriş Yap</h1>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          className={`px-3 py-1 rounded border ${mode === 'password' ? 'bg-neutral-900 text-white' : 'bg-white'}`}
          onClick={() => setMode('password')}
        >E-posta/Şifre</button>
        <button
          className={`px-3 py-1 rounded border ${mode === 'otp' ? 'bg-neutral-900 text-white' : 'bg-white'}`}
          onClick={() => setMode('otp')}
        >Magic Link</button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Şifreniz"
            className="w-full border rounded px-3 py-2"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="w-full border rounded px-3 py-2"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Gönderiliyor..." : "Giriş Linki Gönder"}
          </Button>
        </form>
      )}

      {error && <div className="text-red-500 mt-2">Hata: {error}</div>}
      {info && <div className="text-green-600 mt-2">{info}</div>}

      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <DemoActions onInfo={setInfo} onError={setError} />
      )}
    </div>
  );
}

function DemoActions({ onInfo, onError }: { onInfo:(m:string)=>void; onError:(m:string)=>void }) {
  const [loading, setLoading] = useState(false);

  const call = async (path: string, successMessage: string) => {
    setLoading(true);
    onError(''); onInfo('');
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'x-demo-setup-token': process.env.DEMO_SETUP_TOKEN || '' } });
      const json = await res.json();
      if (!res.ok || json.error) {
        onError(json.error || 'İşlem başarısız');
      } else {
        onInfo(successMessage);
      }
    } catch (e:any) {
      onError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4 space-y-2">
      <div className="text-xs text-neutral-500 mb-2">Demo modu aktif. Aşağıdaki butonlarla hızlı başlangıç yap.</div>
      <Button type="button" disabled={loading} className="w-full" onClick={() => call('/api/demo/setup', 'Demo verileri hazır!')}>
        {loading ? 'İşleniyor...' : 'Demo Verileri Oluştur'}
      </Button>
      <Button type="button" disabled={loading} className="w-full" variant="outline" onClick={() => call('/api/demo/user', 'Demo kullanıcı hazır (demo@yatay.app)!')}>
        {loading ? 'İşleniyor...' : 'Demo Kullanıcı Oluştur'}
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
