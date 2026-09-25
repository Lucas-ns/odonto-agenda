-- OdontoFlow initial schema + RLS
-- Apply via: supabase SQL editor, or `npm run db:migrate`

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_name TEXT DEFAULT 'Minha Clínica',
  slot_minutes INTEGER NOT NULL DEFAULT 15,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  working_hours JSONB DEFAULT '{"mon":[["08:00","12:00"],["13:30","18:00"]],"tue":[["08:00","12:00"],["13:30","18:00"]],"wed":[["08:00","12:00"],["13:30","18:00"]],"thu":[["08:00","12:00"],["13:30","18:00"]],"fri":[["08:00","12:00"],["13:30","18:00"]]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  default_price_cents INTEGER NOT NULL,
  default_duration_min INTEGER NOT NULL,
  color TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_user_name_idx ON services (user_id, name);
CREATE INDEX IF NOT EXISTS services_user_active_idx ON services (user_id, active);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  cpf TEXT,
  notes TEXT,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patients_user_name_idx ON patients (user_id, name);
CREATE INDEX IF NOT EXISTS patients_user_phone_idx ON patients (user_id, phone);

-- Auto-create profile + settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "settings_select_own" ON settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "settings_update_own" ON settings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "settings_insert_own" ON settings FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "services_select_own" ON services FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "services_insert_own" ON services FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "services_update_own" ON services FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "services_delete_own" ON services FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "patients_select_own" ON patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "patients_insert_own" ON patients FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "patients_update_own" ON patients FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "patients_delete_own" ON patients FOR DELETE USING (user_id = auth.uid());
