-- Migration 002: Add indexes on foreign key columns for leaderboard query performance
-- Run ONLY this file in Supabase SQL Editor — do not re-run schema.sql or 001.

CREATE INDEX IF NOT EXISTS idx_daily_steps_participant ON daily_steps(participant_id);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_participant ON weekly_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_week ON weekly_submissions(week_number);
