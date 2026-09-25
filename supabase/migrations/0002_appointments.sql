-- Fase 2: agendamentos + itens (snapshot)

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'completed', 'no_show', 'canceled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('pix', 'cash', 'credit', 'debit', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_user_starts_idx
  ON appointments (user_id, starts_at);
CREATE INDEX IF NOT EXISTS appointments_user_patient_idx
  ON appointments (user_id, patient_id);

CREATE TABLE IF NOT EXISTS appointment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_own" ON appointments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "appointments_insert_own" ON appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_update_own" ON appointments
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "appointments_delete_own" ON appointments
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "appointment_items_select_own" ON appointment_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "appointment_items_insert_own" ON appointment_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "appointment_items_update_own" ON appointment_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "appointment_items_delete_own" ON appointment_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.user_id = auth.uid()
    )
  );
