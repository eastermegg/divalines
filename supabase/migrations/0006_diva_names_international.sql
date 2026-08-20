-- Diva Lines — stage names v3: international vocabulary.
--
-- v2 mixed French words (Panthère, Paillette, Minuit) that read badly in
-- English. The vocabulary is now English-friendly or invented/coined only
-- — no accents, no French-only words — so every name works on an EN or FR
-- story: "Diva Edgy Stiletto", "Diva Stella Elektra", "Diva Ruby Noir".

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
    'Coco', 'Kiki', 'Cleo', 'Nikita', 'Vega', 'Luna', 'Zaza', 'Bianca',
    'Dita', 'Suzi', 'Mona', 'Rita', 'Foxy', 'Jade', 'Nina', 'Uma'
  ];
  -- Second half: the scene, the shoe, the night.
  seconds constant text[] := array[
    'Stiletto', 'Elektra', 'Vinyl', 'Satin', 'Glitter', 'Fever',
    'Tempo', 'Vertigo', 'Mirage', 'Rouge', 'Flame', 'Disco',
    'Panther', 'Comet', 'Eclipse', 'Storm', 'Cadence', 'Midnight',
    'Ember', 'Noir', 'Onyx', 'Halo'
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

-- Restage the rows that carry a French-vocabulary v2 name. Row-by-row so
-- each call sees the previous one's pick (no same-snapshot collisions).
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
