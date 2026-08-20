-- Diva Lines — stage names v2: real scene names.
--
-- "diva solaire" read as a label, not a persona. The new generator builds
-- names that sound like performers on a bill — "Diva Edgy Stiletto",
-- "Diva Stella Elektra": Diva + a first name / attitude + a scene word.
-- Title Case (these are proper nouns, not display copy, so the lowercase
-- brand rule doesn't apply). Uniqueness keeps the n° suffix fallback.

create or replace function public.gen_diva_name()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  -- First half: a name or an attitude.
  firsts constant text[] := array[
    'Stella', 'Edgy', 'Nova', 'Roxy', 'Velvet', 'Lola', 'Gigi', 'Ruby',
    'Coco', 'Kiki', 'Cléo', 'Nikita', 'Vega', 'Luna', 'Zaza', 'Bianca',
    'Dita', 'Suzi', 'Mona', 'Rita', 'Foxy', 'Jade', 'Nina', 'Uma'
  ];
  -- Second half: the scene, the shoe, the night.
  seconds constant text[] := array[
    'Stiletto', 'Elektra', 'Vinyle', 'Satin', 'Paillette', 'Fever',
    'Tempo', 'Vertigo', 'Mirage', 'Rouge', 'Flamme', 'Disco',
    'Panthère', 'Comète', 'Éclair', 'Storm', 'Velours', 'Cadence',
    'Minuit', 'Solaire', 'Braise', 'Nuit'
  ];
  base text;
  candidate text;
  n int := 2;
begin
  base := 'Diva '
    || firsts[1 + floor(random() * array_length(firsts, 1))::int]
    || ' '
    || seconds[1 + floor(random() * array_length(seconds, 1))::int];
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

-- Restage everyone already on the list. Row-by-row so each call sees the
-- names committed by the previous one (a single UPDATE would run every
-- gen_diva_name() against the same snapshot and could collide).
do $$
declare
  lead_id uuid;
begin
  for lead_id in select id from public.leads loop
    update public.leads
      set diva_name = public.gen_diva_name()
      where id = lead_id;
  end loop;
end;
$$;

revoke execute on function public.gen_diva_name() from public, anon, authenticated;
grant execute on function public.gen_diva_name() to service_role;
