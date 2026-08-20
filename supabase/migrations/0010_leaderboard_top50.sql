-- Divalines — return up to 50 ranked divas (was 10) so the board can
-- "load more" client-side. Still stage names + counts only; emails never
-- leave. The client shows 10 and reveals the rest in chunks.

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
        where rank <= 50
      ),
      '[]'::json
    )
  );
$$;

revoke execute on function public.get_leaderboard() from public, anon, authenticated;
grant execute on function public.get_leaderboard() to service_role;
