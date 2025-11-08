import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Demo veri ve demo kullanıcı oluşturma endpoint'i.
// ÖNEMLİ: Gerçek üretimde bu endpoint mutlaka auth kontrolü ve rate limit ile korunmalı.

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo modu kapalı' }, { status: 403 });
  }

  // Basit kontrol: zaten bir ürün varsa tekrar ekleme yapma.
  const { data: existingProducts } = await supabase.from('products').select('id').limit(1);

  // Demo kullanıcı yaratma (Supabase admin API veya service role gerekir - burada anon ile olmaz)
  // Burada sadece en azından tabloları doldurmayı deniyoruz.

  const inserts: any[] = [];

  if (!existingProducts || existingProducts.length === 0) {
    inserts.push(supabase.from('products').insert([
      { name: 'Espresso', price: 55 },
      { name: 'Latte', price: 65 },
      { name: 'Filtre Kahve', price: 50 }
    ]));
  }

  const { data: existingBranches } = await supabase.from('branches').select('id').limit(1);
  if (!existingBranches || existingBranches.length === 0) {
    inserts.push(supabase.from('branches').insert([
      { name: 'Merkez', address: 'İstiklal Cad. No:1' },
      { name: 'Şube 2', address: 'Bağdat Cad. No:45' }
    ]));
  }

  const { data: existingPersonnel } = await supabase.from('personnel').select('id').limit(1);
  if (!existingPersonnel || existingPersonnel.length === 0) {
    inserts.push(supabase.from('personnel').insert([
      { name: 'Ayşe', title: 'Barista' },
      { name: 'Mehmet', title: 'Kasiyer' }
    ]));
  }

  const { data: existingIncome } = await supabase.from('income_records').select('id').limit(1);
  if (!existingIncome || existingIncome.length === 0) {
    inserts.push(supabase.from('income_records').insert([
      { description: 'Günlük Satış', amount: 1250 },
      { description: 'Yan Gelir', amount: 300 }
    ]));
  }

  const errors: string[] = [];
  for (const op of inserts) {
    const { error } = await op;
    if (error) errors.push(error.message);
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Demo verileri oluşturuldu (veya zaten vardı).' });
}
