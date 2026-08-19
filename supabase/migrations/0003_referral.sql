-- Diva Lines — referral mechanics on the waitlist (spec parrainage §1)
--
-- Extends public.leads (the real waitlist table) with a unique referral
-- code per lead, an optional sponsor pointer, and an optional Instagram
-- handle used to DM winners at closing. Rank is NEVER stored — it is
-- always computed by get_rank() below.

alter table public.leads
  add column ref_code     text,
  add column referred_by  text,
  add column insta_handle text;  -- normalized: lowercase, no leading @

-- Collision-safe 6-char code from an unambiguous alphabet (no 0/O/1/l/i).
-- A bare substr(md5(...)) default would abort an insert on the (rare but
-- real) birthday collision; this loops until the code is free.
create or replace function public.gen_ref_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  chars constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.leads where ref_code = code);
  end loop;
  return code;
end;
$$;

-- Backfill existing leads, then lock the column down.
update public.leads set ref_code = public.gen_ref_code() where ref_code is null;

alter table public.leads
  alter column ref_code set default public.gen_ref_code(),
  alter column ref_code set not null;

alter table public.leads
  add constraint leads_ref_code_key unique (ref_code),
  -- FK stops made-up codes from ever landing in referred_by.
  add constraint leads_referred_by_fkey
    foreign key (referred_by) references public.leads (ref_code);

-- The rank aggregate joins on referred_by for every request.
create index leads_referred_by_idx on public.leads (referred_by)
  where referred_by is not null;

-- Rank function (RPC) — returns rank / referral count / total / distance
-- to the top-10 threshold for one code. security definer so it can read
-- the RLS-locked table, but it only ever emits counts — never an email.
create or replace function public.get_rank(p_code text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  with counts as (
    select w.ref_code, w.created_at,
           count(f.id) as referrals
    from public.leads w
    left join public.leads f on f.referred_by = w.ref_code
    group by w.ref_code, w.created_at
  ),
  ranked as (
    select ref_code, referrals,
           row_number() over (order by referrals desc, created_at asc) as rank,
           count(*) over () as total
    from counts
  ),
  threshold as (
    select coalesce((select referrals from ranked where rank = 10), 0) as top10_refs
  )
  select json_build_object(
    'rank', r.rank, 'referrals', r.referrals, 'total', r.total,
    'to_top10', case when r.rank <= 10 then 0
                     else greatest(1, t.top10_refs - r.referrals + 1) end
  )
  from ranked r, threshold t
  where r.ref_code = p_code;
$$;

-- The app never talks to Supabase from the browser (no anon key shipped):
-- both signup and rank lookups go through Next.js API routes running with
-- service_role. Lock the functions down accordingly.
revoke execute on function public.get_rank(text) from public, anon, authenticated;
revoke execute on function public.gen_ref_code() from public, anon, authenticated;
grant execute on function public.get_rank(text) to service_role;
grant execute on function public.gen_ref_code() to service_role;

-- ---------------------------------------------------------------------
-- Clôture (spec §4) — run in the Supabase SQL editor on J-3 to export the
-- full ranking (emails + insta handles) for the manual audit + DMs:
--
--   select row_number() over (order by count(f.id) desc, w.created_at asc) as rang,
--          w.email, w.insta_handle, w.ref_code,
--          count(f.id) as filleules, w.created_at
--   from public.leads w
--   left join public.leads f on f.referred_by = w.ref_code
--   group by w.id
--   order by rang;
--
-- Audit tip: sort by email to spot Gmail variants (dots / +suffixes)
-- among the top-10's filleules before contacting winners.
-- ---------------------------------------------------------------------
