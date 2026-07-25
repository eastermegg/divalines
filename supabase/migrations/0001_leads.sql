-- Diva Lines — waitlist leads (spec §5.1)
create extension if not exists pgcrypto;

create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  email_norm    text generated always as (lower(trim(email))) stored,
  source        text not null default 'landing',
  locale        text,
  referrer      text,
  utm           jsonb default '{}'::jsonb,
  user_agent    text,
  ip_hash       text,                      -- sha256(ip + salt), never the raw IP (RGPD)
  consent       boolean not null default true,
  notion_synced boolean not null default false,
  notion_page_id text,
  created_at    timestamptz not null default now()
);

-- Idempotent signup: duplicates raise 23505, which the API translates
-- into a silent success (never reveal an email is already subscribed).
create unique index leads_email_norm_key on public.leads (email_norm);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_unsynced_idx on public.leads (notion_synced) where notion_synced = false;

-- RLS: locked. No public policy — only the service role reads/writes.
alter table public.leads enable row level security;
