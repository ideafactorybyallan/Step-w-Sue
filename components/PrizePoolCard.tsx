import { Card } from './ui/Card';
import { calculatePrizePool, fmt } from '@/lib/prizes';

interface Props {
  participantCount: number;
}

export function PrizePoolCard({ participantCount }: Props) {
  const prizes = calculatePrizePool(participantCount);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="font-display text-navy text-xl leading-tight">PRIZE POOL</p>
          <p className="font-body text-xs text-gray-500">
            Based on {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <p className="font-body font-semibold text-sm text-navy">🥇 Overall Champion</p>
            <p className="font-body text-xs text-gray-500">Most steps after 4 weeks</p>
          </div>
          <p className="font-display text-gold-dark text-2xl">{fmt(prizes.overallPrize)}</p>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <p className="font-body font-semibold text-sm text-navy">📅 Each Weekly Prize</p>
            <p className="font-body text-xs text-gray-500">Best week × 4 chances</p>
          </div>
          <p className="font-display text-sw-teal-dark text-2xl">{fmt(prizes.weeklyPrizePerWeek)}</p>
        </div>

        <div className="flex justify-between items-center pt-1">
          <div>
            <p className="font-body font-semibold text-sm text-navy">💰 Total Prize Pool</p>
            <p className="font-body text-xs text-gray-500">{fmt(prizes.perPersonBuyIn)}/person buy-in</p>
          </div>
          <p className="font-display text-sw-pink text-3xl">{fmt(prizes.totalPrizePool)}</p>
        </div>
      </div>
    </Card>
  );
}
