'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { OverallLeaderboardRow, WeekLeaderboardRow } from '@/components/LeaderboardRow';
import { WeekWinnerCard } from '@/components/WeekWinnerCard';
import { Podium } from '@/components/Podium';
import { HallOfFame } from '@/components/HallOfFame';
import { SueMark, LockMark } from '@/components/marks';
import { sueFor } from '@/lib/sue-says';
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
  const [emptyQuote] = useState(() => sueFor('empty'));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const tabs: Array<{ id: Tab; label: string; weekData?: WeekData }> = [
    { id: 'overall', label: 'Overall' },
    ...weekStandings.map((w) => ({
      id: w.week_number as Tab,
      label: `Wk ${w.week_number}`,
      weekData: w,
    })),
  ];

  const activeWeek = typeof tab === 'number' ? weekStandings.find((w) => w.week_number === tab) : null;

  // For podium, show only entries that have submitted at least once
  const overallPodium = overall.filter((e) => e.weeks_submitted > 0).slice(0, 3);
  const overallRest = overall.filter((e) => !overallPodium.find((p) => p.participant.id === e.participant.id));
  const overallLeaderSteps = overall[0]?.total_steps ?? 0;

  const weekPodium = activeWeek?.entries.filter((e) => e.is_submitted).slice(0, 3) ?? [];
  const weekRest = activeWeek?.entries.filter((e) => !weekPodium.find((p) => p.participant.id === e.participant.id)) ?? [];
  const weekLeaderSteps = activeWeek?.entries.find((e) => e.is_submitted)?.steps ?? 0;

  return (
    <div className="space-y-4">
      {/* Tab strip + refresh */}
      <div className="flex items-center gap-2">
        <div className="bg-navy/8 rounded-2xl p-1 flex gap-1 overflow-x-auto no-scrollbar flex-1 snap-x snap-mandatory">
          {tabs.map(({ id, label, weekData }) => {
            const isActive = tab === id;
            const status = weekData?.status;
            return (
              <button
                key={String(id)}
                onClick={() => setTab(id)}
                className={clsx(
                  'shrink-0 snap-start px-3.5 py-2.5 rounded-xl font-body font-semibold text-sm transition-all duration-150 flex flex-col items-center gap-0.5 whitespace-nowrap active:scale-[0.95]',
                  isActive
                    ? 'bg-navy text-white shadow-btn-navy'
                    : weekData?.is_locked
                    ? 'bg-gold/10 text-gold-dark border border-gold/30'
                    : status === 'active'
                    ? 'bg-sw-teal/10 text-sw-teal-dark border border-sw-teal/30'
                    : 'text-navy/55 hover:text-navy border border-transparent'
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {status === 'active' && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sw-teal animate-pulse shrink-0" />
                  )}
                  {weekData?.is_locked && <LockMark className="w-3 h-3" />}
                  {label}
                </span>
                {weekData && (
                  <span
                    className={clsx(
                      'font-body text-[10px] leading-none tracking-wider tabular-nums',
                      isActive ? 'text-white/65' : 'text-current opacity-60'
                    )}
                  >
                    {formatDate(weekData.start)}–{formatDate(weekData.end)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="shrink-0 w-10 h-10 rounded-2xl bg-white shadow-el-2 flex items-center justify-center text-navy/60 hover:text-sw-pink hover:shadow-el-3 active:scale-[0.88] transition-all duration-100 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={clsx(isPending && 'animate-spin')} />
        </button>
      </div>

      {/* Overall tab */}
      {tab === 'overall' && (
        <div className="space-y-3 animate-fade-up">
          <p className="font-body text-xs text-gray-400 text-center">
            Overall prize: ${prizes.overallPrize} · most steps after 4 weeks
          </p>

          {/* Podium */}
          {overallPodium.length >= 1 && (
            <Podium
              entries={overallPodium.map((e) => ({
                id: e.participant.id,
                name: e.participant.nickname ?? `${e.participant.first_name} ${e.participant.last_name}`,
                firstName: e.participant.first_name,
                lastName: e.participant.last_name,
                steps: e.total_steps,
              }))}
              currentUserId={currentUserId}
            />
          )}

          {/* Full standings */}
          {overall.length === 0 ? (
            <Card className="border-2 border-dashed border-navy/15">
              <div className="text-center py-8">
                <SueMark className="w-14 h-14 mx-auto mb-3" />
                <p className="font-body italic text-navy/65 text-sm balanced max-w-xs mx-auto">
                  &ldquo;{emptyQuote}&rdquo;
                </p>
              </div>
            </Card>
          ) : overallRest.length > 0 ? (
            <Card padded={false}>
              <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-3">
                Full Rankings
              </p>
              <div className="divide-y divide-gray-100">
                {overallRest.map((entry) => (
                  <OverallLeaderboardRow
                    key={entry.participant.id}
                    entry={entry}
                    isCurrentUser={entry.participant.id === currentUserId}
                    gapToLeader={Math.max(0, overallLeaderSteps - entry.total_steps)}
                  />
                ))}
              </div>
            </Card>
          ) : null}

          <HallOfFame weekStandings={weekStandings} />
        </div>
      )}

      {/* Week tab */}
      {activeWeek && (
        <div className="space-y-3 animate-fade-up">
          {/* Week info */}
          <div
            className={clsx(
              'relative overflow-hidden rounded-2xl shadow-el-3',
              activeWeek.status === 'active'
                ? 'bg-gradient-teal'
                : activeWeek.status === 'upcoming'
                ? 'bg-gray-100 border border-gray-200'
                : 'bg-gradient-navy'
            )}
          >
            {activeWeek.status !== 'upcoming' && (
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="relative px-4 py-4 flex items-center justify-between">
              <div>
                <p
                  className={clsx(
                    'display-md leading-none',
                    activeWeek.status === 'upcoming' ? 'text-navy' : 'text-white drop-shadow-sm'
                  )}
                >
                  WEEK {activeWeek.week_number}
                </p>
                <p
                  className={clsx(
                    'font-body text-xs mt-1',
                    activeWeek.status === 'upcoming' ? 'text-gray-500' : 'text-white/80'
                  )}
                >
                  {formatDate(activeWeek.start)} – {formatDate(activeWeek.end)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={clsx(
                    'display-md leading-none',
                    activeWeek.status === 'upcoming' ? 'text-navy' : 'text-white drop-shadow-sm'
                  )}
                >
                  ${prizes.weeklyPrizePerWeek}
                </p>
                <p
                  className={clsx(
                    'font-body text-xs mt-1 inline-flex items-center gap-1',
                    activeWeek.status === 'upcoming' ? 'text-gray-500' : 'text-white/85'
                  )}
                >
                  {activeWeek.status === 'active' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Active now
                    </>
                  ) : activeWeek.status === 'upcoming' ? (
                    <>⏳ Upcoming</>
                  ) : (
                    <>
                      <LockMark className="w-3 h-3" /> Complete
                    </>
                  )}
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
            <Card className="border-2 border-dashed border-navy/15">
              <div className="text-center py-5">
                <SueMark className="w-12 h-12 mx-auto mb-2 opacity-70" />
                <p className="display-sm text-navy">COMING SOON</p>
                <p className="font-body text-sm text-gray-500 mt-1">
                  Starts {formatDate(activeWeek.start)} — tie those shoes.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Week podium */}
              {weekPodium.length >= 1 && !activeWeek.is_locked && (
                <Podium
                  entries={weekPodium.map((e) => ({
                    id: e.participant.id,
                    name: e.participant.nickname ?? `${e.participant.first_name} ${e.participant.last_name}`,
                    firstName: e.participant.first_name,
                    lastName: e.participant.last_name,
                    steps: e.steps,
                  }))}
                  currentUserId={currentUserId}
                />
              )}

              <Card padded={false}>
                {activeWeek.entries.length === 0 || !activeWeek.entries.some((e) => e.is_submitted) ? (
                  <div className="text-center py-10 px-4">
                    <SueMark className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-body italic text-navy/65 text-sm balanced max-w-xs mx-auto">
                      &ldquo;{emptyQuote}&rdquo;
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-3">
                      {weekPodium.length >= 1 && !activeWeek.is_locked ? 'Full Rankings' : 'Rankings'}
                    </p>
                    <div className="divide-y divide-gray-100">
                      {(weekPodium.length >= 1 && !activeWeek.is_locked ? weekRest : activeWeek.entries).map((entry) => (
                        <WeekLeaderboardRow
                          key={entry.participant.id}
                          entry={entry}
                          isCurrentUser={entry.participant.id === currentUserId}
                          gapToLeader={entry.is_submitted ? Math.max(0, weekLeaderSteps - entry.steps) : undefined}
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
