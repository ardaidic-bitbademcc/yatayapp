
"use client";

import './globals.css';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/reactQueryClient';



function AuthStatus() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription?.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 p-2 bg-neutral-100 border-b">
        <span className="text-sm">Giriş yapan: <b>{user.email}</b></span>
        <Button size="sm" variant="outline" onClick={handleLogout}>Çıkış Yap</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 p-2 bg-neutral-100 border-b">
      <span className="text-sm">Giriş yapılmadı.</span>
      <Link href="/login">
        <Button size="sm" variant="outline">Giriş Yap</Button>
      </Link>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen font-sans antialiased bg-neutral-50 text-neutral-900">
        <QueryClientProvider client={queryClient}>
          <AuthStatus />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}

