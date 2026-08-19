-- Diva Lines — public leaderboard identities.
--
-- The leaderboard page must never expose an email, so every lead gets a
-- generated stage name ("diva solaire", "diva braise n°2"…) drawn from
-- the brand vocabulary (the aura energies + heat adjectives, lowercase —
-- brand voice). Stored, unique, assigned at insert like ref_code.

alter table public.leads add column diva_name text;

create or replace function public.gen_diva_name()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  -- Feminine, lowercase, on-brand. The n° suffix echoes the collection's
  -- N°01 numbering when a word is already taken.
  words constant text[] := array[
    'solaire', 'féline', 'électrique', 'sauvage', 'secrète', 'lunaire',
    'ardente', 'indomptée', 'souveraine', 'magnétique', 'nocturne',
    'insoumise', 'céleste', 'fauve', 'ambrée', 'voilée', 'incandescente',
    'satinée', 'veloutée', 'mordorée', 'braise', 'onde', 'murmure',
    'vertige', 'éclat', 'velours', 'fièvre', 'cadence', 'écho', 'aurore',
    'comète', 'tempête'
  ];
  base text;
  candidate text;
  n int := 2;
begin
  base := 'diva ' || words[1 + floor(random() * array_length(words, 1))::int];
  if not exists (select 1 from public.leads where diva_name = base) then
    return base;
  end if;
  loop
    candidate := base || ' n°' || n;
    exit when not exists (select 1 from public.leads where diva_name = candidate);
    n := n + 1;
  end loop;
  return candidate;
end;
$$;

update public.leads set diva_name = public.gen_diva_name() where diva_name is null;

alter table public.leads
  alter column diva_name set default public.gen_diva_name(),
  alter column diva_name set not null;

alter table public.leads
  add constraint leads_diva_name_key unique (diva_name);

-- get_rank now also returns the stage name so the panel can greet her.
create or replace function public.get_rank(p_code text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  with counts as (
    select w.ref_code, w.diva_name, w.created_at,
           count(f.id) as referrals
    from public.leads w
    left join public.leads f on f.referred_by = w.ref_code
    group by w.id
  ),
  ranked as (
    select ref_code, diva_name, referrals,
           row_number() over (order by referrals desc, created_at asc) as rank,
           count(*) over () as total
    from counts
  ),
  threshold as (
    select coalesce((select referrals from ranked where rank = 10), 0) as top10_refs
  )
  select json_build_object(
    'rank', r.rank, 'referrals', r.referrals, 'total', r.total,
    'diva_name', r.diva_name,
    'to_top10', case when r.rank <= 10 then 0
                     else greatest(1, t.top10_refs - r.referrals + 1) end
  )
  from ranked r, threshold t
  where r.ref_code = p_code;
$$;

-- Public-safe leaderboard: the top 10 as stage name + referral count +
-- rank, plus the list size. Emails, handles and codes never leave.
create or replace function public.get_leaderboard()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  with counts as (
    select w.diva_name, w.created_at, count(f.id) as referrals
    from public.leads w
    left join public.leads f on f.referred_by = w.ref_code
    group by w.id
  ),
  ranked as (
    select diva_name, referrals,
           row_number() over (order by referrals desc, created_at asc) as rank
    from counts
  )
  select json_build_object(
    'total', (select count(*) from counts),
    'top', coalesce(
      (
        select json_agg(
          json_build_object('rank', rank, 'diva_name', diva_name, 'referrals', referrals)
          order by rank
        )
        from ranked
        where rank <= 10
      ),
      '[]'::json
    )
  );
$$;

-- Same lockdown as 0003: everything flows through the Next.js API routes
-- (service_role) — nothing is callable with the anon key.
revoke execute on function public.gen_diva_name() from public, anon, authenticated;
revoke execute on function public.get_leaderboard() from public, anon, authenticated;
grant execute on function public.gen_diva_name() to service_role;
grant execute on function public.get_leaderboard() to service_role;
