-- Clerk auth migration
-- Run this in the Neon console at https://console.neon.tech

-- 1. Add user attribution columns to research_entries
ALTER TABLE research_entries
  ADD COLUMN IF NOT EXISTS created_by_clerk_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- 2. Create per-user votes table (replaces anonymous integer counters)
--    The existing votes_up / votes_down columns stay as denormalized counts
CREATE TABLE IF NOT EXISTS entry_votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  entry_id    UUID        NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  clerk_user_id TEXT      NOT NULL,
  user_name   TEXT,
  vote_type   TEXT        NOT NULL CHECK (vote_type IN ('up', 'down')),
  UNIQUE (entry_id, clerk_user_id)   -- one active vote per user per entry
);

CREATE INDEX IF NOT EXISTS idx_entry_votes_entry_id    ON entry_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_votes_clerk_user  ON entry_votes(clerk_user_id);

-- 3. Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'research_entries'
  AND column_name IN ('created_by_clerk_id', 'created_by_name');

SELECT table_name FROM information_schema.tables
WHERE table_name = 'entry_votes';
