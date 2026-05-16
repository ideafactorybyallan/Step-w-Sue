'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePrizePool, fmt } from '@/lib/prizes';
import { MedalMark, CrownMark } from './marks';

interface Props {
  participantCount: number;
}

function PrizeTier({
  rank, label, sub, amount, bg, textColor,
}: {
  rank: 1 | 2 | 'weekly';
  label: string;
  sub: string;
  amount: string;
  bg: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-xl ${bg} p-3.5 flex items-center gap-3`}>
      <div className="w-10 h-12 flex items-center justify-center shrink-0">
        {rank === 'weekly' ? (
          <MedalMark rank={2} className="w-9 h-11" />
        ) : (
          <MedalMark rank={rank} className="w-9 h-11" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-body text-sm font-bold ${textColor} leading-tight`}>{label}</p>
        <p className="font-body text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
      <p className={`display-sm ${textColor} shrink-0`}>{amount}</p>
    </div>
  );
}

function RuleSection({ icon, title, accent, bg, children }: {
  icon: string; title: string; accent: string; bg: string; children: React.ReactNode;
}) {
  return (
    <div className={`${bg} rounded-xl p-3.5 border-l-4 ${accent}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="font-body font-bold text-navy text-sm">{title}</p>
      </div>
      <div className="font-body text-sm text-navy/75 space-y-0.5 pl-7">{children}</div>
    </div>
  );
}

export function PrizesAndRulesCard({ participantCount }: Props) {
  const [open, setOpen] = useState(false);
  const prizes = calculatePrizePool(participantCount);

  return (
    <div className="bg-white rounded-2xl shadow-el-2 border border-gray-100/80 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50/50 active:bg-gray-100 active:scale-[0.99] transition-all duration-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
            <CrownMark className="w-7 h-6" />
          </div>
          <div className="text-left">
            <p className="display-xs text-navy">PRIZES &amp; RULES</p>
            <p className="font-body text-xs text-gray-400">{fmt(prizes.totalPrizePool)} pool · 4 weeks</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={clsx('text-navy/40 shrink-0 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 animate-fade-up">
          <PrizeTier
            rank={1} label="Overall Champion" sub="Most steps after 4 weeks"
            amount={fmt(prizes.overallPrize)}
            bg="bg-gold/10" textColor="text-gold-dark"
          />
          <PrizeTier
            rank="weekly" label="Weekly Prize × 4" sub="Each week has its own winner"
            amount={fmt(prizes.weeklyPrizePerWeek)}
            bg="bg-sw-teal/8" textColor="text-sw-teal-dark"
          />

          <div className="section-divider my-2" />

          <div className="space-y-2">
            <RuleSection icon="📅" title="Dates" accent="border-sw-pink" bg="bg-sw-pink/5">
              <p>May 18 – June 14, 2026 · 4 weeks</p>
              <p className="text-xs text-gray-500">Submit by Monday midnight after each week.</p>
            </RuleSection>
            <RuleSection icon="💰" title="Buy-In" accent="border-gold" bg="bg-gold/8">
              <p className="font-semibold text-sw-pink">$40 per person</p>
              <p>$20 overall prize + $20 weekly prizes ($5 × 4 weeks)</p>
            </RuleSection>
            <RuleSection icon="🗓️" title="Weekly Schedule" accent="border-sw-teal" bg="bg-sw-teal/8">
              <p className="text-xs">Wk 1 · May 18–24 · submit May 25</p>
              <p className="text-xs">Wk 2 · May 25–31 · submit Jun 1</p>
              <p className="text-xs">Wk 3 · Jun 1–7 · submit Jun 8</p>
              <p className="text-xs">Wk 4 · Jun 8–14 · submit Jun 15</p>
            </RuleSection>
            <RuleSection icon="🏆" title="Prizes" accent="border-gold" bg="bg-gold/8">
              <p>Overall: highest total steps wins</p>
              <p>Weekly: most steps that week wins</p>
              <p className="text-xs text-gray-500">Prize pool scales with participants.</p>
            </RuleSection>
            <RuleSection icon="📝" title="Submissions" accent="border-navy" bg="bg-navy/5">
              <p>Submit daily entries or a single weekly total — your choice.</p>
              <p className="text-xs text-gray-500">Late = still counts, but flagged ⏰</p>
            </RuleSection>
          </div>
        </div>
      )}
    </div>
  );
}
