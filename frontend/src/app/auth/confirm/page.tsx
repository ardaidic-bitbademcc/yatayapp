"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const redirect = searchParams.get("redirect") || "/";

    if (!code) {
      setStatus("error");
      setMessage("Doğrulama kodu bulunamadı.");
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(`Doğrulama hatası: ${error.message}`);
        } else if (data.session) {
          setStatus("success");
          setMessage("Giriş başarılı, yönlendiriliyorsunuz...");
          // Hard redirect ile cookie'lerin tarayıcıda set olmasını sağla
          setTimeout(() => {
            window.location.href = redirect;
          }, 500);
        } else {
          setStatus("error");
          setMessage("Session oluşturulamadı.");
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(`Hata: ${e.message}`);
      }
    })();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 border rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">
          {status === "loading" && "Doğrulanıyor..."}
          {status === "success" && "✓ Başarılı"}
          {status === "error" && "✗ Hata"}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {status === "error" && (
          <a href="/login" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Giriş sayfasına dön
          </a>
        )}
      </div>
    </div>
  );
}
