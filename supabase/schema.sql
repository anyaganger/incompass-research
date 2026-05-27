-- Run this in your Supabase SQL editor to set up the database

create table research_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  finding text not null,
  context text,
  source_firm text not null,
  report_name text,
  report_url text,
  published_year int,
  topics text[] default '{}',
  audience_fit text[] default '{}',
  incompass_relevance text check (incompass_relevance in ('direct', 'adjacent', 'gap')),
  opportunity_type text check (opportunity_type in ('validates_product', 'new_use_case', 'new_buyer', 'white_space', 'competitor_gap')),
  strength_rating int default 3 check (strength_rating between 1 and 5),
  notes text,
  incompass_angle text,
  ai_generated boolean default false,
  feed_item_id uuid
);

create table feed_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  url text not null,
  active boolean default true,
  keywords text[] default '{}',
  last_fetched timestamptz
);

create table feed_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  source_id uuid references feed_sources(id) on delete set null,
  title text,
  url text,
  published_at timestamptz,
  raw_content text,
  ai_analysis jsonb,
  relevance_score int,
  added_to_db boolean default false,
  entry_id uuid references research_entries(id) on delete set null
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  description text,
  opportunity_type text check (opportunity_type in ('white_space', 'narrative_gap', 'competitor_blind_spot')),
  status text default 'active' check (status in ('active', 'addressed', 'monitoring')),
  supporting_entry_ids uuid[] default '{}'
);

-- Indexes for common queries
create index on research_entries (strength_rating desc);
create index on research_entries (created_at desc);
create index on research_entries using gin (topics);
create index on research_entries using gin (audience_fit);
create index on feed_items (created_at desc);
create index on feed_items (added_to_db);

-- Seed default feed sources
insert into feed_sources (name, url, keywords) values
  ('Gallup Workplace', 'https://news.gallup.com/rss.aspx', array['talent', 'workforce', 'engagement', 'leadership', 'employee', 'performance']),
  ('Harvard Business Review', 'https://feeds.hbr.org/harvardbusiness', array['talent', 'leadership', 'performance', 'workforce', 'management', 'CEO']),
  ('MIT Sloan Management Review', 'https://sloanreview.mit.edu/feed/', array['talent', 'leadership', 'performance', 'workforce', 'management']),
  ('McKinsey Insights', 'https://www.mckinsey.com/feeds/default', array['talent', 'workforce', 'leadership', 'performance', 'PE', 'private equity']),
  ('Deloitte Insights', 'https://www2.deloitte.com/us/en/insights/rss.xml', array['talent', 'workforce', 'human capital', 'leadership', 'performance']),
  ('SHRM', 'https://www.shrm.org/rss/pages/rss.aspx', array['talent', 'workforce', 'performance', 'HR', 'employee', 'management']);
