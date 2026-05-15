import { clsx } from 'clsx';
import { Badge } from './ui/Badge';
import type { LeaderboardEntry, WeekLeaderboardEntry } from '@/lib/types';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

// ── Overall leaderboard row ───────────────────────────────────────────────────

interface OverallProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export function OverallLeaderboardRow({ entry, isCurrentUser }: OverallProps) {
  const { participant: p, rank, total_steps, weeks_submitted, title, title_emoji, has_late } = entry;
  const name = p.nickname ?? `${p.first_name} ${p.last_name}`;
  const medal = RANK_MEDALS[rank];

  return (
    <div
      className={clsx(
        'flex items-center gap-3 py-3 px-4',
        isCurrentUser && 'bg-sw-pink/5 rounded-xl border border-sw-pink/20'
      )}
    >
      <div className="w-8 text-center shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="font-display text-navy/40 text-lg">{rank}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={clsx('font-body font-semibold text-navy text-sm', isCurrentUser && 'text-sw-pink')}>
            {name}
            {isCurrentUser && <span className="text-xs text-sw-pink/70 ml-1">(you)</span>}
          </p>
          {has_late && (
            <Badge colorClass="bg-orange-50 text-orange-600 border-orange-200">⏰ Late</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge colorClass={
            rank === 1 ? 'bg-gold/20 text-gold-dark border-gold/40' :
            rank === 2 ? 'bg-sw-pink/10 text-sw-pink border-sw-pink/20' :
            rank === 3 ? 'bg-sw-teal/10 text-sw-teal-dark border-sw-teal/20' :
            'bg-gray-100 text-gray-500 border-gray-200'
          }>
            {title_emoji} {title}
          </Badge>
          <span className="font-body text-xs text-gray-400">
            {weeks_submitted}/4 weeks
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-display text-navy text-xl leading-tight">
          {total_steps.toLocaleString()}
        </p>
        <p className="font-body text-xs text-gray-400">steps</p>
      </div>
    </div>
  );
}

// ── Weekly leaderboard row ────────────────────────────────────────────────────

interface WeekProps {
  entry: WeekLeaderboardEntry;
  isCurrentUser?: boolean;
}

export function WeekLeaderboardRow({ entry, isCurrentUser }: WeekProps) {
  const { participant: p, rank, steps, is_submitted, is_late, is_winner } = entry;
  const name = p.nickname ?? `${p.first_name} ${p.last_name}`;
  const medal = RANK_MEDALS[rank];

  return (
    <div
      className={clsx(
        'flex items-center gap-3 py-3 px-4',
        is_winner && 'bg-gold/10 rounded-xl border border-gold/30',
        isCurrentUser && !is_winner && 'bg-sw-pink/5 rounded-xl border border-sw-pink/20'
      )}
    >
      <div className="w-8 text-center shrink-0">
        {is_winner ? (
          <span className="text-xl">🏆</span>
        ) : medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="font-display text-navy/40 text-lg">{rank}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx('font-body font-semibold text-sm', is_winner ? 'text-gold-dark' : isCurrentUser ? 'text-sw-pink' : 'text-navy')}>
          {name}
          {isCurrentUser && <span className="text-xs ml-1 opacity-60">(you)</span>}
        </p>
        <div className="flex gap-2 mt-0.5 flex-wrap">
          {!is_submitted && (
            <Badge colorClass="bg-gray-100 text-gray-400 border-gray-200">😴 Not submitted</Badge>
          )}
          {is_late && (
            <Badge colorClass="bg-orange-50 text-orange-600 border-orange-200">⏰ Late</Badge>
          )}
          {is_winner && (
            <Badge colorClass="bg-gold/20 text-gold-dark border-gold/40">👑 Week Winner</Badge>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={clsx('font-display text-xl leading-tight', is_submitted ? 'text-navy' : 'text-gray-300')}>
          {steps.toLocaleString()}
        </p>
        <p className="font-body text-xs text-gray-400">steps</p>
      </div>
    </div>
  );
}
