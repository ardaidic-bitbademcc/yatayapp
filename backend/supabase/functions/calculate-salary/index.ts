// @ts-nocheck
// Supabase Edge Function: calculate-salary (taslak)
// Girdi: base_salary, total_hours, overtime_hours, bonuses, deductions
// Çıktı: net_salary ve kalem dökümü
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface SalaryInput {
  base_salary: number;
  total_hours: number;
  overtime_hours: number;
  bonuses?: number;
  deductions?: number;
  hourly_rate?: number; // opsiyonel; yoksa base üzerinden tahmin
  overtime_multiplier?: number; // varsayılan 1.5
}

serve(async (req: Request) => {
  try {
    const body = (await req.json()) as SalaryInput;
    const hourlyRate = body.hourly_rate ?? (body.base_salary / 225); // kaba varsayım
    const overtimeMultiplier = body.overtime_multiplier ?? 1.5;

    const regularPay = hourlyRate * Math.max(0, body.total_hours - body.overtime_hours);
    const overtimePay = hourlyRate * overtimeMultiplier * Math.max(0, body.overtime_hours);
    const bonuses = body.bonuses ?? 0;
    const deductions = body.deductions ?? 0;

    const gross = regularPay + overtimePay + bonuses;
    const net_salary = Math.max(0, gross - deductions);

    return new Response(
      JSON.stringify({
        base_salary: body.base_salary,
        overtime_pay: overtimePay,
        bonuses,
        deductions,
        net_salary,
        breakdown: { regularPay, overtimePay, hourlyRate, overtimeMultiplier },
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 });
  }
});
