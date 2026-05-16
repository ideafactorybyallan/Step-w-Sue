-- Migration 003: Add observer mode to participants
-- Run ONLY this file in Supabase SQL Editor — do not re-run schema.sql, 001, or 002.
-- Observers create accounts but don't pay buy-in, don't appear on the leaderboard,
-- don't count toward the prize pool, and can't submit steps. They can view home + standings.

ALTER TABLE participants ADD COLUMN IF NOT EXISTS is_observer BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_participants_is_observer ON participants(is_observer);
