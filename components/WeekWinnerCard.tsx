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
    <div className="bg-gold/10 border-2 border-gold rounded-2xl p-4 text-center">
      <p className="text-4xl mb-1">🏆</p>
      <p className="font-body text-xs font-semibold text-gold-dark uppercase tracking-widest mb-1">
        Week {weekNumber} Winner
      </p>
      <p className="font-display text-navy text-3xl leading-tight">{name.toUpperCase()}</p>
      <div className="mt-2 inline-block bg-gold/20 rounded-full px-3 py-1">
        <p className="font-display text-gold-dark text-xl">{fmt(prizeAmount)} WINNER</p>
      </div>
      <p className="font-body text-xs text-gray-500 mt-2">
        👑 Week champion — congrats!
      </p>
    </div>
  );
}
