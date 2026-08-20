-- Divalines — stage-name collision suffix: "n°2" reads as a typo in the
-- big display title ("Diva Ruby Vertigo n°2, tu es bien inscrite."). A
-- Roman numeral reads as an intentional persona ("Diva Ruby Vertigo II").

create or replace function public.gen_diva_name()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  firsts constant text[] := array[
    'Stella', 'Edgy', 'Nova', 'Roxy', 'Velvet', 'Lola', 'Gigi', 'Ruby',
    'Coco', 'Kiki', 'Cleo', 'Nikita', 'Vega', 'Luna', 'Zaza', 'Bianca',
    'Dita', 'Suzi', 'Mona', 'Rita', 'Foxy', 'Jade', 'Nina', 'Uma'
  ];
  seconds constant text[] := array[
    'Stiletto', 'Elektra', 'Vinyl', 'Satin', 'Glitter', 'Fever',
    'Tempo', 'Vertigo', 'Mirage', 'Rouge', 'Flame', 'Disco',
    'Panther', 'Comet', 'Eclipse', 'Storm', 'Cadence', 'Midnight',
    'Ember', 'Noir', 'Onyx', 'Halo'
  ];
  -- Roman numerals for the collision suffix (II, III, …). Two words × two
  -- lists give 528 combos for ~92 rows, so collisions are rare and low.
  romans constant text[] := array[
    'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ];
  base text;
  candidate text;
  n int := 1;
begin
  base := 'Diva '
    || firsts[1 + floor(random() * array_length(firsts, 1))::int]
    || ' '
    || seconds[1 + floor(random() * array_length(seconds, 1))::int];
  if not exists (select 1 from public.leads where diva_name = base) then
    return base;
  end if;
  loop
    candidate := base || ' ' || romans[least(n, array_length(romans, 1))];
    exit when not exists (select 1 from public.leads where diva_name = candidate);
    n := n + 1;
  end loop;
  return candidate;
end;
$$;

-- Rewrite existing " n°N" names to the Roman form in place.
update public.leads
set diva_name = regexp_replace(diva_name, ' n°2$', ' II')
where diva_name like '% n°2';
update public.leads
set diva_name = regexp_replace(diva_name, ' n°3$', ' III')
where diva_name like '% n°3';
update public.leads
set diva_name = regexp_replace(diva_name, ' n°([0-9]+)$', ' IV')
where diva_name like '% n°%';

revoke execute on function public.gen_diva_name() from public, anon, authenticated;
grant execute on function public.gen_diva_name() to service_role;
