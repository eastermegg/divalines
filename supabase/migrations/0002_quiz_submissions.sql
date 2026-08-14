-- Diva Lines — aura quiz submissions.
-- Captures the email lead + the quiz result: the five-energy spectrum
-- (scores) and the derived diva profile. Mirrors public.leads so the same
-- API insert + Notion-sync pattern applies. A taker may retake the quiz, so
-- email is intentionally NOT unique here — the newest row per email_norm is
-- their current result. (Contrast: leads.email_norm IS unique — one waitlist
-- signup per person.)
create extension if not exists pgcrypto;

create table public.quiz_submissions (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  email_norm    text generated always as (lower(trim(email))) stored,
  scores        jsonb not null default '{}'::jsonb,   -- {"L'Onde":42,"Le Murmure":24,...} — sums to 100
  profile       text,                                  -- derived diva-profile label
  source        text not null default 'aura-quiz',
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

create index quiz_submissions_email_norm_idx on public.quiz_submissions (email_norm);
create index quiz_submissions_created_at_idx on public.quiz_submissions (created_at desc);
create index quiz_submissions_unsynced_idx on public.quiz_submissions (notion_synced) where notion_synced = false;

-- RLS: locked. No public policy — only the service role reads/writes.
alter table public.quiz_submissions enable row level security;
