# Database Migrations

## How to make safe changes after users have joined

The challenge is live with real user data. **Never drop or recreate tables** — only add.

### Rules

1. Write a new file: `supabase/migrations/NNN_describe_change.sql`
2. Use only safe SQL — examples below
3. Run ONLY the new file in Supabase SQL Editor (not the full schema.sql)
4. Update the app code to match, deploy via PR

### Safe SQL patterns

```sql
-- Add a new column (safe — existing rows get the default)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS display_color TEXT DEFAULT 'pink';

-- Add a new table
CREATE TABLE IF NOT EXISTS my_new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
GRANT ALL ON my_new_table TO service_role;
ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_all_my_new_table" ON my_new_table FOR ALL USING (false);

-- Add an index
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants (first_name, last_name);

-- Add a new announcement or config row
INSERT INTO announcements (message) VALUES ('New feature!') ON CONFLICT DO NOTHING;
```

### Unsafe SQL — never use on a live database

```sql
DROP TABLE ...          -- deletes all data
TRUNCATE ...            -- deletes all rows
ALTER TABLE ... DROP COLUMN ...  -- removes a column and its data
```

### Migration history

| File | Description | Date applied |
|------|-------------|--------------|
| 001_initial_schema.sql | Initial 5-table schema | May 2026 |
| 002_indexes.sql | Performance indexes on hot leaderboard queries | May 2026 |
| 003_observers.sql | Add `is_observer` column to participants (free spectator accounts) | May 2026 |
