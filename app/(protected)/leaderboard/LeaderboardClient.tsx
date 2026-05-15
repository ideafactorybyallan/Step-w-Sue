'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { OverallLeaderboardRow, WeekLeaderboardRow } from '@/components/LeaderboardRow';
import { WeekWinnerCard } from '@/components/WeekWinnerCard';
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

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overall', label: 'Overall' },
    ...weekStandings.map((w) => ({ id: w.week_number as Tab, label: `Wk ${w.week_number}` })),
  ];

  const activeWeek = typeof tab === 'number' ? weekStandings.find((w) => w.week_number === tab) : null;

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="bg-navy/8 rounded-2xl p-1 flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label }) => {
          const isActive = tab === id;
          const weekData = typeof id === 'number' ? weekStandings.find((w) => w.week_number === id) : null;
          const statusIndicator =
            weekData?.status === 'active' ? 'bg-sw-teal' :
            weekData?.status === 'past'   ? 'bg-gray-400' : 'bg-gray-300';

          return (
            <button
              key={String(id)}
              onClick={() => setTab(id)}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap',
                isActive
                  ? 'bg-navy text-white shadow-btn'
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

      {/* Overall tab */}
      {tab === 'overall' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-gold/20 to-amber-50 border border-gold/40 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-display text-navy text-xl leading-tight">OVERALL PRIZE</p>
              <p className="font-display text-gold-dark text-2xl leading-tight">${prizes.overallPrize}</p>
            </div>
            <p className="font-body text-xs text-gray-500 ml-auto text-right leading-relaxed">
              Most total steps<br />wins the pot
            </p>
          </div>

          <Card padded={false}>
            {overall.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-4xl mb-2">👟</p>
                <p className="font-body text-gray-500 text-sm">No one has submitted steps yet!</p>
                <p className="font-body text-xs text-gray-400 mt-1">Be the first to step up.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {overall.map((entry) => (
                  <OverallLeaderboardRow
                    key={entry.participant.id}
                    entry={entry}
                    isCurrentUser={entry.participant.id === currentUserId}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Week tab */}
      {activeWeek && (
        <div className="space-y-3">
          <div className={clsx(
            'rounded-2xl px-4 py-3.5 flex items-center justify-between',
            activeWeek.status === 'active'   ? 'bg-sw-teal/10 border border-sw-teal/30' :
            activeWeek.status === 'upcoming' ? 'bg-gray-50 border border-gray-200' :
            'bg-navy/5 border border-navy/15'
          )}>
            <div>
              <p className="font-display text-navy text-xl leading-tight">WEEK {activeWeek.week_number}</p>
              <p className="font-body text-xs text-gray-500 mt-0.5">
                {formatDate(activeWeek.start)} – {formatDate(activeWeek.end)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-sw-teal-dark text-2xl">${prizes.weeklyPrizePerWeek}</p>
              <p className="font-body text-xs text-gray-500">
                {activeWeek.status === 'active'   ? '🟢 Active' :
                 activeWeek.status === 'upcoming' ? '⏳ Upcoming' : '✅ Complete'}
              </p>
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
            <Card padded={false}>
              {activeWeek.entries.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="font-body text-gray-500 text-sm">No entries yet!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activeWeek.entries.map((entry) => (
                    <WeekLeaderboardRow
                      key={entry.participant.id}
                      entry={entry}
                      isCurrentUser={entry.participant.id === currentUserId}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
