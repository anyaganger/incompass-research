-- Migrate feed sources to be PE-focused
-- Run this in the Neon console at https://console.neon.tech

-- 1. Pause HR-only sources that don't speak PE language
UPDATE feed_sources SET active = false
WHERE name IN ('SHRM HR News', 'FullStack HR');

-- 2. Add PE-focused sources if not already present
INSERT INTO feed_sources (name, url, active, keywords)
VALUES
  ('Korn Ferry Insights', 'https://www.kornferry.com/insights/rss', true,
   ARRAY['leadership', 'talent', 'CEO', 'executive', 'PE', 'succession']),
  ('Bain Private Equity', 'https://www.bain.com/industry-expertise/private-equity/rss/', true,
   ARRAY['private equity', 'portfolio', 'value creation', 'operating partner', 'talent diligence'])
ON CONFLICT DO NOTHING;

-- 3. Verify active sources
SELECT name, active FROM feed_sources ORDER BY active DESC, name;
