-- Divalines — soften the seeded referral counts.
--
-- 0007 gave the top seeds 9/7/6… filleules: demotivating, a real girl
-- needed 10 referrals to take N°01. New ladder tops out at 4 and the
-- bottom half of the board sits at 1 — one referral puts a real signup
-- ON the board, two put her near the top. Total stays 92: the detached
-- children simply become organic fillers (referred_by null).

do $$
declare
  new_counts constant int[] := array[4, 3, 3, 2, 2, 1, 1, 1, 1, 1];
  rec record;
  i int := 0;
begin
  for rec in
    select w.ref_code
    from public.leads w
    join public.leads f on f.referred_by = w.ref_code and f.is_seed
    where w.is_seed
    group by w.ref_code
    order by count(f.id) desc
  loop
    i := i + 1;
    exit when i > array_length(new_counts, 1);
    -- keep the oldest `new_counts[i]` children, detach the rest
    update public.leads
      set referred_by = null
      where id in (
        select id from public.leads
        where referred_by = rec.ref_code and is_seed
        order by created_at asc
        offset new_counts[i]
      );
  end loop;
end;
$$;
