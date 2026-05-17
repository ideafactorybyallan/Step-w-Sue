'use client';
import { useState } from 'react';
import { CrownMark, SparkleMark, SueMark } from '@/components/marks';
import { sueFor, type SueContext } from '@/lib/sue-says';

interface Props {
  weekNumber: number;
  winnerFirstName: string;
  winnerSteps: number;
  margin: number;
  lateCount: number;
  pbHolderFirstName: string | null;
  isClose: boolean;
}

export function WeeklyRoastCard({
  weekNumber,
  winnerFirstName,
  winnerSteps,
  margin,
  lateCount,
  pbHolderFirstName,
  isClose,
}: Props) {
  const ctx: SueContext = pbHolderFirstName && pbHolderFirstName === winnerFirstName
    ? 'weekly-roast-pb'
    : isClose
    ? 'weekly-roast-close'
    : 'weekly-roast-winner';

  const [quote] = useState(() => sueFor(ctx));

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-hero-navy-tight shadow-roast-card">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-gold/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 bg-sw-pink/10 rounded-full blur-3xl" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between mb-4">
        <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-gold-light">
          Week {weekNumber} Wrap-Up
        </p>
        <SueMark className="w-8 h-8 opacity-90" />
      </div>

      {/* Winner block */}
      <div className="relative flex items-start gap-3 mb-4">
        <CrownMark className="w-6 h-5 text-gold shrink-0 mt-1 [filter:drop-shadow(0_2px_8px_rgba(245,197,24,0.5))]" />
        <div>
          <p className="display-lg text-white leading-tight">
            {winnerFirstName.toUpperCase()}
          </p>
          <p className="display-md text-gold leading-tight tabular-nums">
            {winnerSteps.toLocaleString()}
          </p>
          <p className="font-body text-[10px] text-white/50 uppercase tracking-wider mt-0.5">steps</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative flex flex-wrap gap-2 mb-4">
        {margin > 0 && (
          <span className="inline-flex items-center bg-white/10 border border-white/15 rounded-full px-3 py-1 font-body text-xs text-white/70">
            +{margin.toLocaleString()} ahead of 2nd
          </span>
        )}
        {pbHolderFirstName && pbHolderFirstName !== winnerFirstName && (
          <span className="inline-flex items-center gap-1 bg-gold/15 border border-gold/25 rounded-full px-3 py-1 font-body text-xs text-gold-light">
            <SparkleMark className="w-3 h-3" />
            {pbHolderFirstName} hit a PB
          </span>
        )}
        {pbHolderFirstName && pbHolderFirstName === winnerFirstName && (
          <span className="inline-flex items-center gap-1 bg-gold/15 border border-gold/25 rounded-full px-3 py-1 font-body text-xs text-gold-light">
            <SparkleMark className="w-3 h-3" />
            Personal best
          </span>
        )}
      </div>

      {/* Sue quote */}
      <div className="relative border-t border-white/10 pt-4">
        <p className="font-body italic text-white/85 text-sm leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
        {lateCount > 0 && (
          <p className="font-body text-[10px] text-white/40 mt-2">
            {lateCount} {lateCount === 1 ? 'person' : 'people'} cut it close this week.
          </p>
        )}
      </div>
    </div>
  );
}
