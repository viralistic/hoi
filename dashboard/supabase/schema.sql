-- Viralistic Content Dashboard — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.

-- Clients (one row per managed brand/business)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  slug text unique not null,
  website_url text,
  notion_id text,                    -- for Notion sync
  brand_script jsonb,                -- StoryBrand 7-part framework
  tone_of_voice text,
  segments jsonb,                    -- target audience segments
  main_keywords text[],
  extra_keywords text[],
  json_schema_presets jsonb,         -- structured data / schema.org templates
  logo_url text
);

-- Content pieces per client
create table if not exists content_pieces (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null default 'Untitled',
  slug text,
  content text,                      -- full HTML content
  status text not null default 'draft',  -- draft | published | scheduled | archived
  content_type text not null default 'blog',  -- blog | page | social | email | landing
  target_keyword text,
  meta_title text,
  meta_description text,
  seo_score int,
  live_url text,
  ai_generated boolean default false
);

-- Auto-update updated_at on content_pieces
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger content_pieces_updated_at
  before update on content_pieces
  for each row execute function update_updated_at_column();

-- Keyword analysis per content piece
create table if not exists keyword_analysis (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content_pieces(id) on delete cascade,
  keyword text not null,
  target_count int,
  actual_count int,
  density numeric(5,2)
);

-- Crawled pages from client websites
create table if not exists crawled_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  crawled_at timestamptz default now(),
  url text not null,
  title text,
  h1 text,
  h2s text[],
  meta_description text,
  content_text text,
  word_count int,
  status_code int
);

-- Content gap opportunities
create table if not exists content_opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  target_keyword text,
  estimated_volume int,
  difficulty int,
  opportunity_score int,
  status text not null default 'pending'  -- pending | in_progress | published | dismissed
);

-- Performance metrics (populated via n8n GSC/GA sync)
create table if not exists performance_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  content_id uuid references content_pieces(id),
  date date not null,
  url text,
  impressions int,
  clicks int,
  ctr numeric(5,4),
  avg_position numeric(6,2),
  source text not null default 'gsc'
);

-- Row Level Security (enable for production)
-- alter table clients enable row level security;
-- alter table content_pieces enable row level security;
-- alter table keyword_analysis enable row level security;
-- alter table crawled_pages enable row level security;
-- alter table content_opportunities enable row level security;
-- alter table performance_metrics enable row level security;
