import { calculatePrizePool, fmt } from '@/lib/prizes';

interface Props {
  participantCount: number;
}

interface TierProps {
  icon: string;
  label: string;
  sub: string;
  amount: string;
  bg: string;
  textColor: string;
  accentColor: string;
}

function PrizeTier({ icon, label, sub, amount, bg, textColor, accentColor }: TierProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${bg} p-3.5 flex items-center gap-3`}>
      <div className={`w-11 h-11 rounded-full ${accentColor} flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-body text-sm font-bold ${textColor} leading-tight`}>{label}</p>
        <p className="font-body text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
      <p className={`font-display text-2xl ${textColor} shrink-0`}>{amount}</p>
    </div>
  );
}

export function PrizePoolCard({ participantCount }: Props) {
  const prizes = calculatePrizePool(participantCount);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-card border border-gray-100/80">
      {/* Header with subtle gradient */}
      <div className="relative bg-gradient-sunset px-5 py-4 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inset-light">
            🏆
          </div>
          <div>
            <p className="font-display text-white text-2xl leading-tight drop-shadow-sm">PRIZE POOL</p>
            <p className="font-body text-white/85 text-xs">
              {participantCount} challenger{participantCount !== 1 ? 's' : ''} · {fmt(prizes.perPersonBuyIn)} buy-in each
            </p>
          </div>
        </div>
      </div>

      {/* Total banner */}
      <div className="bg-navy text-center py-3 border-t border-white/10">
        <p className="font-body text-white/60 text-xs uppercase tracking-[0.2em] mb-0.5">Total Prize Pool</p>
        <p className="font-display text-gold text-4xl leading-none drop-shadow-sm">{fmt(prizes.totalPrizePool)}</p>
      </div>

      {/* Tiers */}
      <div className="p-3 space-y-2">
        <PrizeTier
          icon="🥇"
          label="Overall Champion"
          sub="Most steps after 4 weeks"
          amount={fmt(prizes.overallPrize)}
          bg="bg-gold/10"
          textColor="text-gold-dark"
          accentColor="bg-gold/25"
        />
        <PrizeTier
          icon="📅"
          label="Weekly Prize × 4"
          sub="Most steps that week"
          amount={fmt(prizes.weeklyPrizePerWeek)}
          bg="bg-sw-teal/8"
          textColor="text-sw-teal-dark"
          accentColor="bg-sw-teal/20"
        />
      </div>
    </div>
  );
}
