import { CrownMark } from '@/components/marks';
import { formatDate } from '@/lib/dates';
import type { Participant } from '@/lib/types';

interface WeekData {
  week_number: number;
  start: string;
  end: string;
  is_locked: boolean;
  winner: Participant | null;
  entries: { steps: number; is_submitted: boolean }[];
  status: 'upcoming' | 'active' | 'past';
}

interface Props {
  weekStandings: WeekData[];
}

function WinnerCard({ week }: { week: WeekData }) {
  const winnerSteps = week.winner
    ? (week.entries.find((e) => (e as any).participant?.id === week.winner?.id)?.steps ??
       week.entries.filter((e) => e.is_submitted).sort((a, b) => b.steps - a.steps)[0]?.steps ?? 0)
    : 0;

  const winnerName = week.winner
    ? week.winner.nickname ?? week.winner.first_name
    : null;

  if (week.is_locked && winnerName) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-4 border border-gold/30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,224,102,0.18) 0%, #ffffff 50%, rgba(245,197,24,0.08) 100%)',
          boxShadow: '0 8px 28px rgba(27,47,94,0.14), 0 0 20px rgba(245,197,24,0.15)',
        }}
      >
        <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 bg-gold/20 rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between mb-2">
          <p className="font-body text-[10px] font-bold tracking-[0.25em] uppercase text-gold-dark">
            Week {week.week_number}
          </p>
          <CrownMark className="w-4 h-3.5 text-gold [filter:drop-shadow(0_1px_4px_rgba(245,197,24,0.5))]" />
        </div>
        <p className="display-md text-navy leading-tight relative">{winnerName.toUpperCase()}</p>
        {winnerSteps > 0 && (
          <p className="font-body text-xs text-gray-400 mt-1 tabular-nums relative">
            {winnerSteps.toLocaleString()} steps
          </p>
        )}
      </div>
    );
  }

  if (week.status === 'active') {
    return (
      <div className="rounded-2xl p-4 bg-sw-teal/[0.08] border border-sw-teal/25 shadow-el-1">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-[10px] font-bold tracking-[0.25em] uppercase text-sw-teal-dark">
            Week {week.week_number}
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-sw-teal animate-pulse" />
        </div>
        <p className="display-xs text-sw-teal-dark leading-tight">IN PROGRESS</p>
        <p className="font-body text-[10px] text-sw-teal-dark/60 mt-1">
          {formatDate(week.start)}–{formatDate(week.end)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-cream border-2 border-dashed border-navy/20 opacity-60">
      <p className="font-body text-[10px] font-bold tracking-[0.25em] uppercase text-navy/40 mb-2">
        Week {week.week_number}
      </p>
      <p className="display-xs text-navy/35 leading-tight">COMING SOON</p>
      <p className="font-body text-[10px] text-gray-400 mt-1">
        {formatDate(week.start)}–{formatDate(week.end)}
      </p>
    </div>
  );
}

export function HallOfFame({ weekStandings }: Props) {
  const hasAnyLocked = weekStandings.some((w) => w.is_locked);
  if (!hasAnyLocked && weekStandings.every((w) => w.status === 'upcoming')) return null;

  return (
    <div className="mt-2">
      <div className="section-divider my-4" />
      <div className="flex items-center gap-2 mb-3">
        <CrownMark className="w-5 h-4 text-gold" />
        <div>
          <p className="display-sm text-navy leading-none">HALL OF FAME</p>
          <p className="font-body text-xs text-gray-400 italic mt-0.5">
            Four weeks. One champion per week.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {weekStandings.map((week) => (
          <WinnerCard key={week.week_number} week={week} />
        ))}
      </div>
    </div>
  );
}
