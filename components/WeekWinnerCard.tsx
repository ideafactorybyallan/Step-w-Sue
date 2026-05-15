import type { Participant } from '@/lib/types';
import { fmt } from '@/lib/prizes';

interface Props {
  winner: Participant;
  weekNumber: number;
  prizeAmount: number;
}

export function WeekWinnerCard({ winner, weekNumber, prizeAmount }: Props) {
  const name = winner.nickname ?? `${winner.first_name} ${winner.last_name}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-gold/20 via-gold/10 to-amber-50 p-5 text-center shadow-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,197,24,0.2),transparent_70%)] pointer-events-none" />
      <div className="relative">
        <p className="text-5xl mb-2">🏆</p>
        <p className="font-body text-xs font-bold text-gold-dark uppercase tracking-[0.2em] mb-2">
          Week {weekNumber} Champion
        </p>
        <p className="font-display text-navy text-4xl leading-tight mb-3">
          {name.toUpperCase()}
        </p>
        <div className="inline-flex items-center gap-2 bg-gold/30 border border-gold/50 rounded-full px-4 py-1.5">
          <span className="font-display text-gold-dark text-2xl">{fmt(prizeAmount)}</span>
          <span className="font-body text-gold-dark text-sm font-semibold">WINNER</span>
        </div>
        <p className="font-body text-xs text-navy/50 mt-3">
          👑 Congrats — you crushed it this week!
        </p>
      </div>
    </div>
  );
}
