"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";
import {
  fetchLeaderboard,
  fetchRank,
  getMe,
  type Leaderboard,
  type RankInfo,
} from "@/lib/referral";

/** Small glowing diva orbs — one per row, colour cycled by rank so each
 * girl gets her own light (no faces before launch, brand rule). */
const ROW_ORBS: { g: string; glow: string }[] = [
  { g: "linear-gradient(135deg,#ff7a2f,#ff5ec4)", glow: "rgba(255,122,47,0.55)" },
  { g: "linear-gradient(135deg,#ff5ec4,#6e2ba8)", glow: "rgba(255,94,196,0.5)" },
  { g: "linear-gradient(135deg,#ffd9a8,#ff7a2f)", glow: "rgba(255,217,168,0.5)" },
  { g: "linear-gradient(135deg,#c4408f,#6e2ba8)", glow: "rgba(196,64,143,0.55)" },
  { g: "linear-gradient(135deg,#ff9a4e,#c4408f)", glow: "rgba(255,154,78,0.5)" },
  { g: "linear-gradient(135deg,#ff5ec4,#ffd9a8)", glow: "rgba(255,94,196,0.45)" },
  { g: "linear-gradient(135deg,#6e2ba8,#ff5ec4)", glow: "rgba(110,43,168,0.6)" },
];

/**
 * The public ranking — a clean, lined list: every row on the same left
 * edge, hairline rules, readable at a glance. The drama stays in the
 * details (top-3 heat numerals, her glowing row, a soft staggered
 * entrance), never in the layout.
 *
 * Emails never reach this component: the API only serves diva_name +
 * counts. "You" is detected by matching your get_rank diva_name.
 */
export default function LeaderboardBoard() {
  const { dict } = useDictionary();
  const L = dict.leaderboard;
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [me, setMeInfo] = useState<RankInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(10);
  const rootRef = useRef<HTMLDivElement>(null);

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

  // Entrance + a live pulse: rows stagger in, then every couple seconds a
  // random diva's row flushes with heat and lifts a hair, as if she just
  // got a referral. Keeps the board feeling alive, not frozen.
  useEffect(() => {
    if (!board || prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".lb-row",
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.05,
        },
      );

      // Ambient activity — one row at a time, on a jittered cadence. Rows
      // are re-queried each tick so "load more" entries pulse too.
      const pulse = () => {
        const rows = gsap.utils.toArray<HTMLElement>(".lb-list .lb-row");
        const el = rows[Math.floor(Math.random() * rows.length)];
        if (el) {
          const count = el.querySelector<HTMLElement>(".lb-count");
          const num = el.querySelector<HTMLElement>(".lb-rank");
          gsap
            .timeline()
            .to(el, {
              backgroundColor: "rgba(255,122,47,0.07)",
              y: -3,
              duration: 0.35,
              ease: "power2.out",
            })
            .to(
              [count, num].filter(Boolean),
              { color: "#ffd9a8", duration: 0.35 },
              0,
            )
            .to(
              count,
              { scale: 1.14, duration: 0.35, ease: "back.out(2)" },
              0,
            )
            .to(
              el,
              {
                backgroundColor: "rgba(255,122,47,0)",
                y: 0,
                duration: 0.8,
                ease: "power2.inOut",
              },
              "+=0.25",
            )
            .to(
              [count, num].filter(Boolean),
              { clearProps: "color,scale,transform", duration: 0.6 },
              "<",
            );
        }
        timer = setTimeout(pulse, 1600 + Math.random() * 2200);
      };
      timer = setTimeout(pulse, 1400);
    }, rootRef);
    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [board]);

  // "Load more" reveals the next chunk — fade just the new rows in.
  const prevVisible = useRef(10);
  useEffect(() => {
    if (visible <= prevVisible.current || prefersReducedMotion()) {
      prevVisible.current = visible;
      return;
    }
    const rows = gsap.utils.toArray<HTMLElement>(
      ".lb-list .lb-row",
      rootRef.current,
    );
    const fresh = rows.slice(prevVisible.current);
    prevVisible.current = visible;
    if (fresh.length) {
      gsap.fromTo(
        fresh,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 },
      );
    }
  }, [visible]);

  function refsLabel(n: number): string {
    return n === 1 ? L.refsOne : fill(L.refsMany, { n });
  }

  if (failed) {
    return <p className="text-cream/60 text-sm">{dict.form.errorServer}</p>;
  }

  // No skeleton: below ~10 signups the board never shows, so a ten-row
  // placeholder would flash and collapse. The rows stagger in on arrival.
  if (!board) return null;

  // No fake divas at launch: the board earns its place at ~10 real
  // signups. Before that the page is hero + form + urgency only.
  if (board.total < 10) return null;

  const row = (
    rank: number,
    name: string,
    referrals: number,
    isMe: boolean,
  ) => {
    const top3 = rank <= 3;
    return (
      <li
        key={name}
        className={`lb-row flex items-baseline gap-4 border-b py-[1.1rem] sm:gap-6 ${
          isMe ? "border-heat-orange/40" : "border-cream/10"
        }`}
      >
        <span
          className={`lb-rank w-14 shrink-0 text-sm tracking-[0.08em] tabular-nums ${
            top3 ? "text-heat-orange" : "text-cream/45"
          }`}
        >
          {`N°${String(rank).padStart(2, "0")}`}
        </span>
        <span
          aria-hidden
          className="size-3 shrink-0 self-center rounded-full"
          style={{
            backgroundImage: ROW_ORBS[(rank - 1) % ROW_ORBS.length].g,
            boxShadow: `0 0 12px 1px ${ROW_ORBS[(rank - 1) % ROW_ORBS.length].glow}`,
          }}
        />
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
        <span className="lb-count text-cream/55 inline-block shrink-0 origin-right text-sm tabular-nums">
          {refsLabel(referrals)}
        </span>
      </li>
    );
  };

  const shown = board.top.slice(0, visible);
  const hasMore = visible < board.top.length;

  return (
    <div ref={rootRef}>
      {/* Live indicator only (no "top 10" title). */}
      <div className="mb-8 flex justify-end">
        <span className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-cream/45 uppercase">
          <span aria-hidden className="live-dot size-1.5" />
          {L.live}
        </span>
      </div>

      {/* Your ranking on top of everything — no frame, just the lined row
          with its heat accents (glow name, orange rule, "toi ✦"). */}
      {me?.rank !== undefined && me.diva_name ? (
        <ol className="mb-6">
          {row(me.rank, me.diva_name, me.referrals ?? 0, true)}
        </ol>
      ) : null}

      {board.top.length === 0 ? (
        <p className="text-cream font-serif text-xl italic">{L.empty}</p>
      ) : (
        <ol aria-label={L.listAria} className="lb-list">
          {shown.map((r) =>
            row(r.rank, r.diva_name, r.referrals, r.diva_name === me?.diva_name),
          )}
        </ol>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + 10)}
          className="border-cream/25 text-cream hover:bg-cream/5 mt-6 w-full cursor-pointer rounded-pill border py-3 text-sm font-medium transition-colors"
        >
          {L.loadMore}
        </button>
      ) : null}
    </div>
  );
}
