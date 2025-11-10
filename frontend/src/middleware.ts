import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rol bazlı yetki kontrolü (production-ready)
// JWT decode ile user metadata içindeki role claim kontrolü

const PROTECTED_PATHS = [
  '/branch',
  '/personnel',
  '/menu',
  '/pos',
  '/finance'
];

// Admin-only paths (isteğe bağlı genişletilebilir)
const ADMIN_ONLY_PATHS = [
  '/settings'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAdminOnly = ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p));

    console.log('Middleware: pathname', pathname);
    console.log('Middleware: cookie header', req.headers.get('cookie'));

  if (!isProtected && !isAdminOnly) return NextResponse.next();

  // Env vars kontrolü
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing in middleware');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie'den access token'ı oku
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );

    console.log('Middleware: parsed cookies', cookies);

  // Supabase auth cookie pattern: sb-{project-ref}-auth-token
  // Yeni: sb-access-token cookie'sini kullan
  const authCookieKey = 'sb-access-token';

    console.log('Middleware: authCookieKey', authCookieKey);

  if (!authCookieKey || !cookies[authCookieKey]) {
      console.log('Middleware: auth cookie bulunamadı', cookies);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie value'yu parse et (base64-url-encoded JSON)
  let accessToken: string | null = null;
  try {
    console.log('Middleware: auth cookie value', cookies[authCookieKey]);
    accessToken = decodeURIComponent(cookies[authCookieKey]);
  } catch (e) {
    console.error('Middleware: auth cookie parse hatası', e);
  }

  if (!accessToken) {
      console.log('Middleware: access token yok');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token ile Supabase user doğrula
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    console.log('Middleware: supabase user', user, 'error', error);

  if (error || !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only path kontrolü
  if (isAdminOnly) {
    const role = user.user_metadata?.role || 'user';
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\.\n*|api|favicon.ico).*)']
};
