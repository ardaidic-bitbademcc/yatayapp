import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const sb = createClient(supabaseUrl, serviceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { method, pin, employee_id } = body;

    // MVP: pin veya employee_id ile personel doğrulama
    let personnelId = null;
    if (method === 'pin') {
      if (!pin) return NextResponse.json({ error: 'Pin gerekli' }, { status: 400 });
      
      // Tüm personeli çek ve PIN'i hash ile karşılaştır
      const { data: allPersonnel, error: fetchError } = await sb.from('personnel').select('id, pin');
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
      
      // PIN'i hash ile karşılaştır
      for (const p of allPersonnel || []) {
        if (p.pin && await bcrypt.compare(pin, p.pin)) {
          personnelId = p.id;
          break;
        }
      }
      
      if (!personnelId) return NextResponse.json({ error: 'PIN bulunamadı veya hatalı' }, { status: 404 });
    } else if (method === 'employee_id') {
      if (!employee_id) return NextResponse.json({ error: 'employee_id gerekli' }, { status: 400 });
      const { data, error } = await sb.from('personnel').select('id').eq('employee_id', employee_id).limit(1).single();
      if (error || !data) return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
      personnelId = data.id;
    }

    if (!personnelId) return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 400 });

    // Son attendance kaydını kontrol et
    const { data: lastAttendance, error: lastError } = await sb
      .from('attendance')
      .select('*')
      .eq('personnel_id', personnelId)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .single();

    // Eğer hata varsa ve "no rows" değilse, gerçek bir hata
    if (lastError && lastError.code !== 'PGRST116') {
      return NextResponse.json({ error: lastError.message }, { status: 500 });
    }

    // Eğer son kayıt varsa ve check_out_at boşsa → çıkış yap
    if (lastAttendance && !lastAttendance.check_out_at) {
      const checkInTime = new Date(lastAttendance.check_in_at);
      const checkOutTime = new Date();
      const durationMs = checkOutTime.getTime() - checkInTime.getTime();
      const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

      const { error: updateError } = await sb
        .from('attendance')
        .update({ 
          check_out_at: checkOutTime.toISOString(),
          method 
        })
        .eq('id', lastAttendance.id);

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

      return NextResponse.json({ 
        ok: true, 
        action: 'checkout',
        duration_hours: parseFloat(durationHours),
        check_in_at: lastAttendance.check_in_at,
        check_out_at: checkOutTime.toISOString()
      });
    }

    // Yeni giriş yap
    const { error: insertError } = await sb
      .from('attendance')
      .insert({ 
        personnel_id: personnelId, 
        check_in_at: new Date().toISOString(), 
        method 
      });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'checkin' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
