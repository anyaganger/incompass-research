-- V2 migration: weighted scoring, competitor tracking, vote system
-- Run in Neon SQL editor BEFORE deploying new code

ALTER TABLE research_entries
  ADD COLUMN IF NOT EXISTS votes_up INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS votes_down INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS competitors_mentioned TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS used_in_outreach BOOLEAN DEFAULT FALSE;

ALTER TABLE feed_items
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- Backfill competitor mentions on existing entries
UPDATE research_entries re
SET competitors_mentioned = (
  SELECT COALESCE(array_agg(DISTINCT comp), '{}')
  FROM unnest(ARRAY[
    'Workday','Lattice','15Five','SuccessFactors','BambooHR',
    'Rippling','Culture Amp','Leapsome','Betterworks','TriNet',
    'Korn Ferry','Mercer','Heidrick'
  ]) AS comp
  WHERE LOWER(re.finding || ' ' || COALESCE(re.context,'') || ' ' || COALESCE(re.incompass_angle,''))
        LIKE '%' || LOWER(comp) || '%'
)
WHERE competitors_mentioned = '{}' OR competitors_mentioned IS NULL;
