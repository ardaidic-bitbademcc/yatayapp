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

  if (!isProtected && !isAdminOnly) return NextResponse.next();

  // Supabase client (middleware'de anon key kullanılır)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: req.headers.get('cookie') || ''
        }
      }
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

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
