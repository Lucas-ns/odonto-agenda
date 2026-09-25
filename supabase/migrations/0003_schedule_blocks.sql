-- Fase 3: bloqueios de agenda

CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS schedule_blocks_user_starts_idx
  ON schedule_blocks (user_id, starts_at);

ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_blocks_select_own" ON schedule_blocks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "schedule_blocks_insert_own" ON schedule_blocks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "schedule_blocks_update_own" ON schedule_blocks
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "schedule_blocks_delete_own" ON schedule_blocks
  FOR DELETE USING (user_id = auth.uid());
