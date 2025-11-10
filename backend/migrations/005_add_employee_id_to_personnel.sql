-- Personnel tablosuna employee_id (benzersiz personel kimliği) ekle
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE;

-- Mevcut personeller için otomatik ID oluştur (P001, P002, ...)
DO $$
DECLARE
  rec RECORD;
  counter INT := 1;
BEGIN
  FOR rec IN SELECT id FROM public.personnel WHERE employee_id IS NULL ORDER BY created_at
  LOOP
    UPDATE public.personnel 
    SET employee_id = 'P' || LPAD(counter::TEXT, 3, '0')
    WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- employee_id'yi NOT NULL yap
ALTER TABLE public.personnel ALTER COLUMN employee_id SET NOT NULL;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_personnel_employee_id ON public.personnel(employee_id);
