-- Step w Sue — Database Schema
-- Run this in the Supabase SQL Editor for your project.
-- Go to: supabase.com → your project → SQL Editor → New Query → paste & run

-- ── Participants ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  nickname      TEXT,
  pin_hash      TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_observer   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_participants_is_observer ON participants(is_observer);

-- ── Daily Steps (personal helper, not shown on leaderboard) ──────────────────
CREATE TABLE IF NOT EXISTS daily_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  entry_date      DATE NOT NULL,
  steps           INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, entry_date)
);

-- ── Weekly Submissions (what counts for the leaderboard) ─────────────────────
CREATE TABLE IF NOT EXISTS weekly_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  week_number     INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  total_steps     INTEGER NOT NULL DEFAULT 0 CHECK (total_steps >= 0),
  is_late         BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked       BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, week_number)
);

-- ── Week Configuration ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weeks (
  week_number          INTEGER PRIMARY KEY,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  submission_deadline  DATE NOT NULL,
  is_locked            BOOLEAN NOT NULL DEFAULT FALSE,
  winner_override_id   UUID REFERENCES participants(id) ON DELETE SET NULL
);

INSERT INTO weeks (week_number, start_date, end_date, submission_deadline)
VALUES
  (1, '2026-05-18', '2026-05-24', '2026-05-25'),
  (2, '2026-05-25', '2026-05-31', '2026-06-01'),
  (3, '2026-06-01', '2026-06-07', '2026-06-08'),
  (4, '2026-06-08', '2026-06-14', '2026-06-15')
ON CONFLICT (week_number) DO NOTHING;

-- ── Announcements (admin can post these) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security (enabled but bypassed by service role key) ─────────────
ALTER TABLE participants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_steps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;

-- The app uses the service role key server-side, which bypasses RLS.
-- These restrictive policies block any accidental direct client access.
CREATE POLICY "deny_all_participants"       ON participants       FOR ALL USING (false);
CREATE POLICY "deny_all_daily_steps"        ON daily_steps        FOR ALL USING (false);
CREATE POLICY "deny_all_weekly_submissions" ON weekly_submissions  FOR ALL USING (false);
CREATE POLICY "deny_all_weeks"              ON weeks              FOR ALL USING (false);
CREATE POLICY "deny_all_announcements"      ON announcements      FOR ALL USING (false);


-- ── Grants (ensure service role has full access) ──────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
