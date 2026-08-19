"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";
import {
  fetchLeaderboard,
  fetchRank,
  getMe,
  type Leaderboard,
  type RankInfo,
} from "@/lib/referral";

/**
 * The public ranking — top 10 as stage names ("diva solaire"), plus your
 * own row pinned underneath when you're not in the tier that matters.
 * Emails never reach this component: the API only serves diva_name +
 * counts. "You" is detected by matching your get_rank diva_name against
 * the rows (or pinning your row below).
 */
export default function LeaderboardBoard() {
  const { dict } = useDictionary();
  const L = dict.leaderboard;
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [me, setMeInfo] = useState<RankInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((b) => {
        if (!cancelled) setBoard(b);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    const myCode = getMe();
    if (myCode) {
      fetchRank(myCode)
        .then((r) => {
          if (!cancelled && r) setMeInfo(r);
        })
        .catch(() => {
          /* board still renders without the pinned row */
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  function refsLabel(n: number): string {
    return n === 1 ? L.refsOne : fill(L.refsMany, { n });
  }

  if (failed) {
    return <p className="text-cream/60 text-sm">{dict.form.errorServer}</p>;
  }

  if (!board) {
    // Skeleton — ten hairline rows so the page doesn't jump.
    return (
      <div aria-hidden className="animate-pulse">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="border-cream/10 border-b py-4">
            <div className="bg-cream/10 h-4 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const meInTop =
    me?.diva_name !== undefined &&
    board.top.some((row) => row.diva_name === me.diva_name);

  const row = (
    rank: number,
    name: string,
    referrals: number,
    isMe: boolean,
  ) => (
    <li
      key={name}
      className={`flex items-baseline gap-4 border-b py-4 ${
        isMe ? "border-heat-orange/40" : "border-cream/10"
      }`}
    >
      <span
        className={`w-12 shrink-0 text-xs tracking-[0.08em] tabular-nums ${
          rank <= 3 ? "text-heat-orange" : "text-cream/45"
        }`}
      >
        {`N°${String(rank).padStart(2, "0")}`}
      </span>
      <span
        className={`min-w-0 flex-1 truncate font-serif text-xl italic sm:text-2xl ${
          isMe ? "text-heat-glow" : "text-cream"
        }`}
      >
        {name}
        {isMe ? (
          <span className="text-heat-orange ml-3 align-middle font-sans text-xs not-italic">
            {L.you}
          </span>
        ) : null}
      </span>
      <span className="text-cream/55 shrink-0 text-sm tabular-nums">
        {refsLabel(referrals)}
      </span>
    </li>
  );

  return (
    <div>
      <p className="text-cream/45 text-xs tracking-[0.08em]">
        {fill(L.count, { n: board.total })} · {L.privacyNote}
      </p>

      {board.top.length === 0 ? (
        <p className="text-cream mt-8 font-serif text-xl italic">{L.empty}</p>
      ) : (
        <ol aria-label={L.listAria} className="mt-4">
          {board.top.map((r) =>
            row(r.rank, r.diva_name, r.referrals, r.diva_name === me?.diva_name),
          )}
        </ol>
      )}

      {/* Your row, pinned below the tier when you're outside it */}
      {me?.rank !== undefined && me.diva_name && !meInTop ? (
        <>
          <p aria-hidden className="text-cream/35 py-3 text-center text-sm">
            ⋯
          </p>
          <ol className="border-cream/10 border-t">
            {row(me.rank, me.diva_name, me.referrals ?? 0, true)}
          </ol>
          <p className="text-cream/55 mt-3 text-xs">
            {me.to_top10
              ? me.to_top10 === 1
                ? dict.referral.toTopOne
                : fill(dict.referral.toTopMany, { n: me.to_top10 })
              : null}
          </p>
        </>
      ) : null}
    </div>
  );
}
