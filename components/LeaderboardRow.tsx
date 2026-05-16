import { clsx } from 'clsx';
import { Badge } from './ui/Badge';
import { avatarBg, avatarFg } from '@/lib/avatar';
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
  const bg = avatarBg(p.first_name, p.last_name);
  const fg = avatarFg(bg);

  return (
    <div
      className={clsx(
        'flex items-center gap-3.5 py-4 px-4',
        rank === 1 && 'bg-gold/5',
        isCurrentUser && 'border-l-2 border-sw-pink bg-sw-pink/5'
      )}
    >
      <div className="w-7 text-center shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="font-display text-navy/35 text-lg">{rank}</span>
        )}
      </div>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-xs shrink-0"
        style={{ backgroundColor: bg, color: fg }}
      >
        {p.first_name.charAt(0).toUpperCase()}{p.last_name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={clsx('font-body font-semibold text-sm', isCurrentUser ? 'text-sw-pink' : 'text-navy')}>
            {name}
            {isCurrentUser && <span className="text-xs text-sw-pink/60 ml-1">(you)</span>}
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
          <span className="font-body text-xs text-gray-400">{weeks_submitted}/4 wks</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-display text-navy text-xl leading-tight">{total_steps.toLocaleString()}</p>
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
  const bg = avatarBg(p.first_name, p.last_name);
  const fg = avatarFg(bg);

  return (
    <div
      className={clsx(
        'flex items-center gap-3.5 py-4 px-4',
        is_winner && 'bg-gold/8 border-l-2 border-gold',
        isCurrentUser && !is_winner && 'bg-sw-pink/5 border-l-2 border-sw-pink'
      )}
    >
      <div className="w-7 text-center shrink-0">
        {is_winner ? (
          <span className="text-xl">🏆</span>
        ) : medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="font-display text-navy/35 text-lg">{rank}</span>
        )}
      </div>

      <div
        className={clsx(
          'w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-xs shrink-0 transition-opacity',
          !is_submitted && 'opacity-40'
        )}
        style={{ backgroundColor: bg, color: fg }}
      >
        {p.first_name.charAt(0).toUpperCase()}{p.last_name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx(
          'font-body font-semibold text-sm',
          is_winner ? 'text-gold-dark' : isCurrentUser ? 'text-sw-pink' : is_submitted ? 'text-navy' : 'text-gray-400'
        )}>
          {name}
          {isCurrentUser && <span className="text-xs ml-1 opacity-60">(you)</span>}
        </p>
        <div className="flex gap-1.5 mt-0.5 flex-wrap">
          {!is_submitted && (
            <Badge colorClass="bg-gray-100 text-gray-400 border-gray-200">Not submitted</Badge>
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
        <p className={clsx('font-display text-xl leading-tight', is_submitted ? 'text-navy' : 'text-gray-200')}>
          {steps.toLocaleString()}
        </p>
        <p className="font-body text-xs text-gray-400">steps</p>
      </div>
    </div>
  );
}
