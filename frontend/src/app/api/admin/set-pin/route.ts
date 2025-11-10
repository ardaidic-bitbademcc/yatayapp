import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const sb = createClient(supabaseUrl, serviceKey);

/**
 * Admin-only route: Personel için PIN set etme (hash ile)
 * POST /api/admin/set-pin
 * Body: { personnelId: uuid, pin: '1234' }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personnelId, pin } = body;

    if (!personnelId || !pin) {
      return NextResponse.json({ error: 'personnelId ve pin gerekli' }, { status: 400 });
    }

    // PIN'i bcrypt ile hashle
    const hashedPin = await bcrypt.hash(pin, 10);

    // Personnel tablosunda güncelle
    const { error } = await sb.from('personnel').update({ pin: hashedPin }).eq('id', personnelId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, message: 'PIN başarıyla set edildi' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
