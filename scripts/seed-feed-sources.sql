-- Substack + newsletter RSS sources for Incompass feed
-- Run in Neon SQL editor

INSERT INTO feed_sources (name, url, keywords, active) VALUES
  (
    'The PE Operator Letter',
    'https://peoperator.substack.com/feed',
    ARRAY['private equity', 'portfolio company', 'PE', 'operating partner', 'value creation'],
    true
  ),
  (
    'Talent Sherpa',
    'https://talentsherpa.substack.com/feed',
    ARRAY['talent', 'leadership', 'hiring', 'workforce', 'performance'],
    true
  ),
  (
    'The Talent Code',
    'https://thetalentcode.substack.com/feed',
    ARRAY['talent', 'performance management', 'HR', 'leadership effectiveness'],
    true
  ),
  (
    'Mark Farrer-Brown',
    'https://markfarrerbrown.substack.com/feed',
    ARRAY['private equity', 'talent', 'leadership', 'portfolio', 'PE'],
    true
  ),
  (
    'FullStack HR',
    'https://www.fullstackhr.io/feed',
    ARRAY['HR', 'talent', 'people operations', 'workforce', 'performance'],
    true
  ),
  (
    'Make Work Better',
    'https://makewo.substack.com/feed',
    ARRAY['engagement', 'workplace', 'performance', 'employee experience'],
    true
  );
