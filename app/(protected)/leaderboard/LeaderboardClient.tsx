'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { OverallLeaderboardRow, WeekLeaderboardRow } from '@/components/LeaderboardRow';
import { WeekWinnerCard } from '@/components/WeekWinnerCard';
import { Podium } from '@/components/Podium';
import { formatDate } from '@/lib/dates';
import type { LeaderboardEntry, WeekLeaderboardEntry, Participant } from '@/lib/types';

interface WeekData {
  week_number: number;
  start: string;
  end: string;
  entries: WeekLeaderboardEntry[];
  is_locked: boolean;
  winner: Participant | null;
  status: 'upcoming' | 'active' | 'past';
}

interface Prizes {
  overallPrize: number;
  weeklyPrizePerWeek: number;
  totalPrizePool: number;
  participantCount: number;
}

interface Props {
  overall: LeaderboardEntry[];
  weekStandings: WeekData[];
  currentUserId: string | null;
  prizes: Prizes;
}

type Tab = 'overall' | number;

export function LeaderboardClient({ overall, weekStandings, currentUserId, prizes }: Props) {
  const [tab, setTab] = useState<Tab>('overall');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overall', label: 'Overall' },
    ...weekStandings.map((w) => ({ id: w.week_number as Tab, label: `Wk ${w.week_number}` })),
  ];

  const activeWeek = typeof tab === 'number' ? weekStandings.find((w) => w.week_number === tab) : null;

  // For podium, show only entries that have submitted at least once
  const overallPodium = overall.filter((e) => e.weeks_submitted > 0).slice(0, 3);
  const overallRest = overall.filter((e) => !overallPodium.find((p) => p.participant.id === e.participant.id));

  const weekPodium = activeWeek?.entries.filter((e) => e.is_submitted).slice(0, 3) ?? [];
  const weekRest = activeWeek?.entries.filter((e) => !weekPodium.find((p) => p.participant.id === e.participant.id)) ?? [];

  return (
    <div className="space-y-4">
      {/* Tab selector + refresh */}
      <div className="flex items-center gap-2">
        <div className="bg-navy/8 rounded-2xl p-1 flex gap-1 overflow-x-auto no-scrollbar flex-1">
          {tabs.map(({ id, label }) => {
            const isActive = tab === id;
            const weekData = typeof id === 'number' ? weekStandings.find((w) => w.week_number === id) : null;
            const statusIndicator =
              weekData?.status === 'active' ? 'bg-sw-teal' :
              weekData?.status === 'past' ? 'bg-gray-400' : 'bg-gray-300';

            return (
              <button
                key={String(id)}
                onClick={() => setTab(id)}
                className={clsx(
                  'shrink-0 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap',
                  isActive
                    ? 'bg-navy text-white shadow-btn-navy'
                    : 'text-navy/60 hover:text-navy'
                )}
              >
                {weekData && (
                  <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', statusIndicator)} />
                )}
                {label}
                {weekData?.is_locked && <span className="text-xs opacity-70">🔒</span>}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="shrink-0 w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-navy/60 hover:text-sw-pink hover:shadow-card-hover transition-all disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={clsx(isPending && 'animate-spin')} />
        </button>
      </div>

      {/* Overall tab */}
      {tab === 'overall' && (
        <div className="space-y-3 animate-fade-up">
          {/* Prize banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-sunset shadow-card-lg">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative px-4 py-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inset-light shrink-0">
                🏆
              </div>
              <div className="flex-1">
                <p className="font-body text-white/90 text-xs uppercase tracking-[0.15em] font-semibold">Overall Champion Prize</p>
                <p className="font-display text-white text-4xl leading-none drop-shadow-sm">${prizes.overallPrize}</p>
                <p className="font-body text-white/80 text-xs mt-0.5">Most total steps wins the pot</p>
              </div>
            </div>
          </div>

          {/* Podium */}
          {overallPodium.length >= 1 && (
            <Podium entries={overallPodium.map((e) => ({
              id: e.participant.id,
              name: e.participant.nickname ?? `${e.participant.first_name} ${e.participant.last_name}`,
              firstName: e.participant.first_name,
              lastName: e.participant.last_name,
              steps: e.total_steps,
            }))} currentUserId={currentUserId} />
          )}

          {/* Full standings */}
          {overall.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-4xl mb-2">👟</p>
                <p className="font-body text-gray-500 text-sm">No one has submitted steps yet!</p>
                <p className="font-body text-xs text-gray-400 mt-1">Be the first to step up.</p>
              </div>
            </Card>
          ) : overallRest.length > 0 ? (
            <Card padded={false}>
              <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">
                Full Rankings
              </p>
              <div className="divide-y divide-gray-50">
                {overallRest.map((entry) => (
                  <OverallLeaderboardRow
                    key={entry.participant.id}
                    entry={entry}
                    isCurrentUser={entry.participant.id === currentUserId}
                  />
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {/* Week tab */}
      {activeWeek && (
        <div className="space-y-3 animate-fade-up">
          {/* Week info */}
          <div className={clsx(
            'relative overflow-hidden rounded-2xl shadow-card',
            activeWeek.status === 'active' ? 'bg-gradient-teal' :
            activeWeek.status === 'upcoming' ? 'bg-gray-100 border border-gray-200' :
            'bg-gradient-navy'
          )}>
            {activeWeek.status !== 'upcoming' && (
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="relative px-4 py-4 flex items-center justify-between">
              <div>
                <p className={clsx('font-display text-3xl leading-none', activeWeek.status === 'upcoming' ? 'text-navy' : 'text-white drop-shadow-sm')}>
                  WEEK {activeWeek.week_number}
                </p>
                <p className={clsx('font-body text-xs mt-1', activeWeek.status === 'upcoming' ? 'text-gray-500' : 'text-white/80')}>
                  {formatDate(activeWeek.start)} – {formatDate(activeWeek.end)}
                </p>
              </div>
              <div className="text-right">
                <p className={clsx('font-display text-3xl leading-none', activeWeek.status === 'upcoming' ? 'text-navy' : 'text-white drop-shadow-sm')}>
                  ${prizes.weeklyPrizePerWeek}
                </p>
                <p className={clsx('font-body text-xs mt-1', activeWeek.status === 'upcoming' ? 'text-gray-500' : 'text-white/80')}>
                  {activeWeek.status === 'active' ? '🟢 Active now' :
                   activeWeek.status === 'upcoming' ? '⏳ Upcoming' : '✅ Complete'}
                </p>
              </div>
            </div>
          </div>

          {activeWeek.is_locked && activeWeek.winner && (
            <WeekWinnerCard
              winner={activeWeek.winner}
              weekNumber={activeWeek.week_number}
              prizeAmount={prizes.weeklyPrizePerWeek}
            />
          )}

          {activeWeek.status === 'upcoming' ? (
            <Card>
              <div className="text-center py-4">
                <p className="text-3xl mb-2">📅</p>
                <p className="font-display text-navy text-xl">COMING SOON</p>
                <p className="font-body text-sm text-gray-500 mt-1">
                  Starts {formatDate(activeWeek.start)} — get those shoes ready!
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Week podium */}
              {weekPodium.length >= 1 && !activeWeek.is_locked && (
                <Podium entries={weekPodium.map((e) => ({
                  id: e.participant.id,
                  name: e.participant.nickname ?? `${e.participant.first_name} ${e.participant.last_name}`,
                  firstName: e.participant.first_name,
                  lastName: e.participant.last_name,
                  steps: e.steps,
                }))} currentUserId={currentUserId} />
              )}

              <Card padded={false}>
                {activeWeek.entries.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="font-body text-gray-500 text-sm">No entries yet!</p>
                  </div>
                ) : (
                  <>
                    <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">
                      {weekPodium.length >= 1 && !activeWeek.is_locked ? 'Full Rankings' : 'Rankings'}
                    </p>
                    <div className="divide-y divide-gray-50">
                      {(weekPodium.length >= 1 && !activeWeek.is_locked ? weekRest : activeWeek.entries).map((entry) => (
                        <WeekLeaderboardRow
                          key={entry.participant.id}
                          entry={entry}
                          isCurrentUser={entry.participant.id === currentUserId}
                        />
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
