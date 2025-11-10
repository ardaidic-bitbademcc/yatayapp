-- Attendance tablosu: personel giriş/çıkış kayıtları
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id uuid REFERENCES public.personnel(id) ON DELETE CASCADE,
  check_in_at timestamptz,
  check_out_at timestamptz,
  method text NOT NULL DEFAULT 'pin', -- 'pin' veya 'qr'
  device_id text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Örnek indexler
CREATE INDEX IF NOT EXISTS idx_attendance_personnel_id ON public.attendance(personnel_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_at ON public.attendance(check_in_at);
