import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const sb = createClient(supabaseUrl, serviceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { method, pin, qr } = body;

    // MVP: pin doğrulaması - demo olarak personnel tablosunda pin alanı olduğunu varsayıyoruz
    let personnelId = null;
    if (method === 'pin') {
      if (!pin) return NextResponse.json({ error: 'Pin gerekli' }, { status: 400 });
      const { data, error } = await sb.from('personnel').select('id').eq('pin', pin).limit(1).single();
      if (error || !data) return NextResponse.json({ error: 'Pin bulunamadı' }, { status: 404 });
      personnelId = data.id;
    } else if (method === 'qr') {
      // QR doğrulama MVP: qr payload'tan personnel id alınabilir veya cihaz tarayıcı backend'e kimlik gönderir
      // Şimdilik demo: kabul et
      personnelId = body.personnelId || null;
    }

    if (!personnelId) return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 400 });

    // Eğer son kayıtta check_out_at boşsa, önce çıkış yaz; değilse giriş yaz
    const last = await sb.from('attendance').select('*').eq('personnel_id', personnelId).order('created_at', { ascending: false }).limit(1).single();
    if (last.error && last.error.code !== 'PGRST116') {
      // ignore no rows; PGRST116 is no_rows? handle generically
    }

    if (last.data && !last.data.check_out_at) {
      // set check_out_at
      const { error } = await sb.from('attendance').update({ check_out_at: new Date().toISOString(), method }).eq('id', last.data.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, action: 'checkout' });
    }

    // yeni check-in
    const { error } = await sb.from('attendance').insert({ personnel_id: personnelId, check_in_at: new Date().toISOString(), method });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'checkin' });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
