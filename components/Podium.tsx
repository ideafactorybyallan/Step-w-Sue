import { clsx } from 'clsx';
import { avatarBg, avatarFg } from '@/lib/avatar';

interface Entry {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  steps: number;
}

interface Props {
  entries: Entry[];
  currentUserId: string | null;
}

interface SpotProps {
  entry: Entry | undefined;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
}

const RANK_CONFIG = {
  1: {
    height: 'h-24',
    medal: '🥇',
    medalSize: 'text-4xl',
    bgGradient: 'bg-gradient-gold',
    glow: 'shadow-glow-gold',
    label: '1ST',
    labelColor: 'text-navy',
    avatarSize: 'w-16 h-16 text-xl',
    avatarBorder: 'border-4 border-gold',
    order: 'order-2',
  },
  2: {
    height: 'h-16',
    medal: '🥈',
    medalSize: 'text-3xl',
    bgGradient: 'bg-gradient-to-b from-gray-300 to-gray-400',
    glow: 'shadow-card',
    label: '2ND',
    labelColor: 'text-white',
    avatarSize: 'w-14 h-14 text-lg',
    avatarBorder: 'border-4 border-gray-300',
    order: 'order-1',
  },
  3: {
    height: 'h-12',
    medal: '🥉',
    medalSize: 'text-2xl',
    bgGradient: 'bg-gradient-to-b from-amber-600 to-amber-700',
    glow: 'shadow-card',
    label: '3RD',
    labelColor: 'text-white',
    avatarSize: 'w-12 h-12 text-base',
    avatarBorder: 'border-4 border-amber-600',
    order: 'order-3',
  },
};

function PodiumSpot({ entry, rank, isCurrentUser }: SpotProps) {
  const config = RANK_CONFIG[rank];

  if (!entry) {
    return (
      <div className={clsx('flex-1 flex flex-col items-center', config.order)}>
        <div className={clsx('w-12 h-12 rounded-full bg-gray-200 mb-2', rank === 1 && 'w-16 h-16', rank === 2 && 'w-14 h-14')} />
        <p className="font-body text-xs text-gray-300 mb-1">—</p>
        <div className={clsx('w-full rounded-t-xl bg-gray-200', config.height)}>
          <p className={clsx('font-display text-center pt-2', config.labelColor, 'text-gray-400')}>{config.label}</p>
        </div>
      </div>
    );
  }

  const bg = avatarBg(entry.firstName, entry.lastName);
  const fg = avatarFg(bg);

  return (
    <div className={clsx('flex-1 flex flex-col items-center', config.order)}>
      <span className={clsx('mb-1', config.medalSize)}>{config.medal}</span>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-body font-bold shrink-0 mb-2',
          config.avatarSize,
          config.avatarBorder,
          rank === 1 && 'shadow-glow-gold animate-float-slow'
        )}
        style={{ backgroundColor: bg, color: fg }}
      >
        {entry.firstName.charAt(0).toUpperCase()}{entry.lastName.charAt(0).toUpperCase()}
      </div>
      <p className={clsx(
        'font-body font-bold text-sm text-center leading-tight px-1 mb-0.5 truncate max-w-full',
        isCurrentUser ? 'text-sw-pink' : 'text-navy'
      )}>
        {entry.name}
        {isCurrentUser && <span className="text-xs ml-0.5 opacity-60">(you)</span>}
      </p>
      <p className={clsx('font-display leading-tight mb-2', rank === 1 ? 'text-2xl text-gold-dark' : 'text-xl text-navy/70')}>
        {entry.steps > 9999 ? `${(entry.steps/1000).toFixed(1)}k` : entry.steps.toLocaleString()}
      </p>
      <div className={clsx('w-full rounded-t-xl flex items-center justify-center', config.bgGradient, config.height)}>
        <p className={clsx('font-display text-lg', config.labelColor)}>{config.label}</p>
      </div>
    </div>
  );
}

export function Podium({ entries, currentUserId }: Props) {
  const [first, second, third] = [entries[0], entries[1], entries[2]];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-card border border-gray-100/80 p-4">
      <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
        🏆 Top 3 🏆
      </p>
      <div className="flex items-end gap-2">
        <PodiumSpot entry={second} rank={2} isCurrentUser={second?.id === currentUserId} />
        <PodiumSpot entry={first} rank={1} isCurrentUser={first?.id === currentUserId} />
        <PodiumSpot entry={third} rank={3} isCurrentUser={third?.id === currentUserId} />
      </div>
    </div>
  );
}
