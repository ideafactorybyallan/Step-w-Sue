import type { Participant } from '@/lib/types';
import { fmt } from '@/lib/prizes';
import { CrownMark } from './marks';

interface Props {
  winner: Participant;
  weekNumber: number;
  prizeAmount: number;
}

export function WeekWinnerCard({ winner, weekNumber, prizeAmount }: Props) {
  const name = winner.nickname ?? `${winner.first_name} ${winner.last_name}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-gold/25 via-gold/10 to-amber-50 p-5 text-center shadow-el-4 [box-shadow:0_16px_48px_-4px_rgba(245,197,24,0.30)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,197,24,0.30),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gold/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <CrownMark className="w-14 h-12 mx-auto mb-2 [filter:drop-shadow(0_4px_10px_rgba(212,168,0,0.55))]" />
        <p className="font-body text-xs font-bold text-gold-dark uppercase tracking-[0.2em] mb-2">
          Week {weekNumber} Champion
        </p>
        <p className="display-lg text-navy mb-3">
          {name.toUpperCase()}
        </p>
        <div className="inline-flex items-center gap-2 bg-gold/30 border border-gold/50 rounded-full px-4 py-1.5">
          <span className="display-sm text-gold-dark leading-none">{fmt(prizeAmount)}</span>
          <span className="font-body text-gold-dark text-sm font-semibold">WINNER</span>
        </div>
        <p className="font-body text-xs text-navy/60 mt-3 italic">
          &ldquo;You crushed it. Sue salutes.&rdquo;
        </p>
      </div>
    </div>
  );
}
