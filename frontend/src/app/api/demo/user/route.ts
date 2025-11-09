import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo modu kapalı' }, { status: 403 });
  }

  const tokenRequired = !!process.env.DEMO_SETUP_TOKEN;
  const headerToken = req.headers.get('x-demo-setup-token');
  
  // Debug: Log token values (remove in production)
  console.log('[DEBUG] tokenRequired:', tokenRequired);
  console.log('[DEBUG] headerToken present:', !!headerToken);
  console.log('[DEBUG] tokens match:', headerToken === process.env.DEMO_SETUP_TOKEN);
  
  if (tokenRequired && headerToken !== process.env.DEMO_SETUP_TOKEN) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Service role key eksik' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = 'demo@yatay.app';
  const password = 'Demo1234!';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'demo' }
  });

  if (error && !String(error.message).toLowerCase().includes('already')) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email, password, created: !error, userId: data?.user?.id });
}
