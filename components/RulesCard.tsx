'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface RuleSectionProps {
  icon: string;
  title: string;
  accent: string;
  bg: string;
  children: React.ReactNode;
}

function RuleSection({ icon, title, accent, bg, children }: RuleSectionProps) {
  return (
    <div className={`${bg} rounded-xl p-3.5 border-l-4 ${accent}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="font-body font-bold text-navy text-sm">{title}</p>
      </div>
      <div className="font-body text-sm text-navy/75 space-y-0.5 pl-7">
        {children}
      </div>
    </div>
  );
}

export function RulesCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 p-5 transition-colors hover:bg-gray-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/8 flex items-center justify-center text-xl">📋</div>
          <div className="text-left">
            <p className="font-display text-navy text-xl leading-tight">CHALLENGE RULES</p>
            <p className="font-body text-xs text-gray-400">Dates, buy-in, prizes & submissions</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={clsx('text-navy/40 shrink-0 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2.5 animate-fade-up">
          <RuleSection icon="📅" title="Dates" accent="border-sw-pink" bg="bg-sw-pink/5">
            <p>May 18 – June 14, 2026 · 4 weeks</p>
            <p className="text-xs text-gray-500">Submit by Monday midnight after each week.</p>
          </RuleSection>

          <RuleSection icon="💰" title="Buy-In" accent="border-gold" bg="bg-gold/8">
            <p>$20 overall + $20 weekly ($5 × 4)</p>
            <p className="font-semibold text-sw-pink">$40 total per person</p>
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
            <p>Daily steps or one weekly total.</p>
            <p className="text-xs text-gray-500">Late = still counts, but flagged ⏰</p>
          </RuleSection>
        </div>
      )}
    </div>
  );
}
