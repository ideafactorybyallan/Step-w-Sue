import { clsx } from 'clsx';
import { Badge } from './ui/Badge';
import { avatarBg, avatarFg } from '@/lib/avatar';
import { MedalMark, FootprintMark, LockMark } from './marks';
import type { LeaderboardEntry, WeekLeaderboardEntry } from '@/lib/types';

function RankCell({ rank }: { rank: number }) {
  if (rank === 1 || rank === 2 || rank === 3) {
    return <MedalMark rank={rank} className="w-5 h-7" />;
  }
  return <span className="display-sm text-navy/35">{rank}</span>;
}

function Avatar({
  firstName,
  lastName,
  isCurrentUser,
  isDimmed,
}: {
  firstName: string;
  lastName: string;
  isCurrentUser?: boolean;
  isDimmed?: boolean;
}) {
  const bg = avatarBg(firstName, lastName);
  const fg = avatarFg(bg);
  return (
    <div
      className={clsx(
        'w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0 shadow-inset-light',
        isDimmed && 'opacity-40',
        isCurrentUser && '[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_3px_rgba(232,35,74,0.30)]'
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {firstName.charAt(0).toUpperCase()}
      {lastName.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Overall leaderboard row ───────────────────────────────────────────────────

interface OverallProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  gapToLeader?: number;
}

export function OverallLeaderboardRow({ entry, isCurrentUser, gapToLeader }: OverallProps) {
  const { participant: p, rank, total_steps, weeks_submitted, title, title_emoji, title_colorClass, has_late } = entry;
  const name = p.nickname ?? `${p.first_name} ${p.last_name}`;

  return (
    <div
      className={clsx(
        'flex items-center gap-3.5 py-4 px-4',
        rank === 1 && 'bg-gold/5',
        isCurrentUser && 'bg-sw-pink/[0.04]'
      )}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        <RankCell rank={rank} />
      </div>

      <Avatar firstName={p.first_name} lastName={p.last_name} isCurrentUser={isCurrentUser} />

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
          <Badge colorClass={title_colorClass}>
            {title_emoji} {title}
          </Badge>
          <span className="font-body text-xs text-gray-400">{weeks_submitted}/4 wks</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="display-xs text-navy leading-tight flex items-center justify-end gap-1">
          <FootprintMark className="w-3 h-3 text-navy/35" />
          {total_steps.toLocaleString()}
        </p>
        {typeof gapToLeader === 'number' && gapToLeader > 0 ? (
          <p className="font-body text-[10px] text-gray-400 tabular-nums">
            +{gapToLeader.toLocaleString()} vs #1
          </p>
        ) : rank === 1 && total_steps > 0 ? (
          <p className="font-body text-[10px] text-gold-dark font-semibold tracking-wider uppercase">
            Leader
          </p>
        ) : (
          <p className="font-body text-xs text-gray-400">steps</p>
        )}
      </div>
    </div>
  );
}

// ── Weekly leaderboard row ────────────────────────────────────────────────────

interface WeekProps {
  entry: WeekLeaderboardEntry;
  isCurrentUser?: boolean;
  gapToLeader?: number;
}

export function WeekLeaderboardRow({ entry, isCurrentUser, gapToLeader }: WeekProps) {
  const { participant: p, rank, steps, is_submitted, is_late, is_winner } = entry;
  const name = p.nickname ?? `${p.first_name} ${p.last_name}`;

  return (
    <div
      className={clsx(
        'flex items-center gap-3.5 py-4 px-4',
        is_winner && 'bg-gold/8',
        isCurrentUser && !is_winner && 'bg-sw-pink/[0.04]'
      )}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        {is_winner ? (
          <MedalMark rank={1} className="w-5 h-7" />
        ) : (
          <RankCell rank={rank} />
        )}
      </div>

      <Avatar
        firstName={p.first_name}
        lastName={p.last_name}
        isCurrentUser={isCurrentUser}
        isDimmed={!is_submitted}
      />

      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'font-body font-semibold text-sm',
            is_winner ? 'text-gold-dark' : isCurrentUser ? 'text-sw-pink' : is_submitted ? 'text-navy' : 'text-gray-400'
          )}
        >
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
            <Badge colorClass="bg-gold/20 text-gold-dark border-gold/40">
              <span className="inline-flex items-center gap-1">
                <LockMark className="w-3 h-3" /> Week Winner
              </span>
            </Badge>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className={clsx(
            'display-xs leading-tight flex items-center justify-end gap-1',
            is_submitted ? 'text-navy' : 'text-gray-200'
          )}
        >
          {is_submitted && <FootprintMark className="w-3 h-3 text-navy/35" />}
          {steps.toLocaleString()}
        </p>
        {typeof gapToLeader === 'number' && gapToLeader > 0 && is_submitted ? (
          <p className="font-body text-[10px] text-gray-400 tabular-nums">
            +{gapToLeader.toLocaleString()} vs #1
          </p>
        ) : rank === 1 && is_submitted ? (
          <p className="font-body text-[10px] text-gold-dark font-semibold tracking-wider uppercase">
            Leader
          </p>
        ) : (
          <p className="font-body text-xs text-gray-400">steps</p>
        )}
      </div>
    </div>
  );
}
