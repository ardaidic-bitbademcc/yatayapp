import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';

  // Client-side'da Supabase session exchange yapılacak
  // Şimdilik code'u query param olarak page'e forward et
  if (code) {
    return NextResponse.redirect(new URL(`/auth/confirm?code=${code}&redirect=${encodeURIComponent(redirect)}`, requestUrl.origin));
  }

  // Code yoksa direkt redirect
  return NextResponse.redirect(new URL(redirect, requestUrl.origin));
}
