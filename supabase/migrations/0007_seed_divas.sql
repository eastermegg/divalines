-- Divalines — launch seeding: 92 fake divas, clearly flagged.
--
-- The list must read alive on day one: a populated top 10 with names and
-- referral counts, and a believable total. All fake rows carry
-- is_seed = true (+ source = 'seed' + @seed.divalines.invalid emails) so
-- they are trivially identifiable in Supabase, excludable from exports,
-- and MUST be filtered out when picking the real prize winners:
--   select * from public.leads where not is_seed order by ...
--
-- Exactly 92 rows: 10 named tops whose referral counts are real edges
-- (42 seed rows referred_by them, so get_leaderboard counts honestly)
-- plus 40 organic fillers. Timestamps sit in the past so any real signup
-- ranks after equal-count seeds (referrals desc, created_at asc).

alter table public.leads add column is_seed boolean not null default false;

do $$
declare
  top_codes text[] := array[]::text[];
  counts constant int[] := array[9, 7, 6, 5, 4, 3, 3, 2, 2, 1]; -- 42 total
  code text;
  i int;
  c int;
  n int := 0;
  base constant timestamptz := now() - interval '14 days';
begin
  -- idempotence guard: never double-seed
  if exists (select 1 from public.leads where is_seed) then
    return;
  end if;

  -- the named tier — 10 divas the board will show
  for i in 1..10 loop
    n := n + 1;
    insert into public.leads (email, source, is_seed, locale, created_at)
    values (
      format('seed-%s@seed.divalines.invalid', lpad(n::text, 3, '0')),
      'seed', true, 'fr', base + n * interval '37 minutes'
    )
    returning ref_code into code;
    top_codes := array_append(top_codes, code);
  end loop;

  -- their referred girls — real rows, so the counts are genuine
  for i in 1..10 loop
    for c in 1..counts[i] loop
      n := n + 1;
      insert into public.leads
        (email, source, is_seed, locale, referred_by, created_at)
      values (
        format('seed-%s@seed.divalines.invalid', lpad(n::text, 3, '0')),
        'seed', true, 'fr', top_codes[i], base + n * interval '37 minutes'
      );
    end loop;
  end loop;

  -- organic fillers up to exactly 92
  while n < 92 loop
    n := n + 1;
    insert into public.leads (email, source, is_seed, locale, created_at)
    values (
      format('seed-%s@seed.divalines.invalid', lpad(n::text, 3, '0')),
      'seed', true, 'fr', base + n * interval '37 minutes'
    );
  end loop;
end;
$$;
