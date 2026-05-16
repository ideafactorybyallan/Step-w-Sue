'use client';
import { clsx } from 'clsx';
import { avatarBg, avatarFg } from '@/lib/avatar';
import { MedalMark } from './marks';
import { sueFor } from '@/lib/sue-says';
import { useState } from 'react';

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
    height: 'h-28',
    pedestalGradient: 'bg-gradient-to-b from-[#FFE066] via-[#F5C518] to-[#B88A00]',
    label: '1ST',
    labelColor: 'text-navy',
    avatarSize: 'w-16 h-16',
    avatarBorder: 'ring-4 ring-gold ring-offset-2 ring-offset-white',
    order: 'order-2',
    stepsClass: 'display-md text-gold-dark',
  },
  2: {
    height: 'h-20',
    pedestalGradient: 'bg-gradient-to-b from-[#F3F4F6] via-[#C7CCD3] to-[#7F8693]',
    label: '2ND',
    labelColor: 'text-navy/85',
    avatarSize: 'w-14 h-14',
    avatarBorder: 'ring-4 ring-gray-300 ring-offset-2 ring-offset-white',
    order: 'order-1',
    stepsClass: 'display-sm text-navy/80',
  },
  3: {
    height: 'h-14',
    pedestalGradient: 'bg-gradient-to-b from-[#E2A678] via-[#B16A3E] to-[#7A4423]',
    label: '3RD',
    labelColor: 'text-white',
    avatarSize: 'w-12 h-12',
    avatarBorder: 'ring-4 ring-amber-700/70 ring-offset-2 ring-offset-white',
    order: 'order-3',
    stepsClass: 'display-sm text-navy/80',
  },
} as const;

function PodiumSpot({ entry, rank, isCurrentUser }: SpotProps) {
  const config = RANK_CONFIG[rank];

  if (!entry) {
    return (
      <div className={clsx('flex-1 flex flex-col items-center', config.order)}>
        <div className={clsx('rounded-full bg-gray-200', config.avatarSize, 'mb-2')} />
        <p className="font-body text-xs text-gray-300 mb-1">—</p>
        <div
          className={clsx('w-full rounded-t-xl bg-gray-200 flex items-center justify-center', config.height)}
        >
          <p className={clsx('display-sm text-gray-400')}>{config.label}</p>
        </div>
      </div>
    );
  }

  const bg = avatarBg(entry.firstName, entry.lastName);
  const fg = avatarFg(bg);

  return (
    <div className={clsx('relative flex-1 flex flex-col items-center', config.order)}>
      <MedalMark
        rank={rank}
        className={clsx('w-7 h-9 mb-1', rank === 1 && 'animate-float-slow w-9 h-11')}
      />
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-display shrink-0 mb-2 shadow-inset-light',
          config.avatarSize,
          config.avatarBorder,
          rank === 1 && '[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_24px_rgba(245,197,24,0.5)]',
          isCurrentUser && 'ring-offset-2 ring-offset-white'
        )}
        style={{ backgroundColor: bg, color: fg, fontSize: rank === 1 ? '1.5rem' : '1.25rem' }}
      >
        {entry.firstName.charAt(0).toUpperCase()}{entry.lastName.charAt(0).toUpperCase()}
      </div>
      <p
        className={clsx(
          'font-body font-bold text-sm text-center leading-tight px-1 mb-1 truncate max-w-full',
          isCurrentUser ? 'text-sw-pink' : 'text-navy'
        )}
      >
        {entry.name}
        {isCurrentUser && <span className="text-xs ml-0.5 opacity-60">(you)</span>}
      </p>
      <p className={clsx('leading-tight mb-2', config.stepsClass)}>
        {entry.steps > 9999 ? `${(entry.steps / 1000).toFixed(1)}k` : entry.steps.toLocaleString()}
      </p>
      <div
        className={clsx(
          'relative w-full rounded-t-xl flex items-center justify-center overflow-hidden border-t border-white/40',
          config.pedestalGradient,
          config.height
        )}
        style={{
          boxShadow:
            rank === 1
              ? 'inset 0 -10px 18px rgba(0,0,0,0.18), 0 8px 28px rgba(27,47,94,0.14)'
              : 'inset 0 -8px 16px rgba(0,0,0,0.18), 0 2px 12px rgba(27,47,94,0.10)',
        }}
      >
        <p className={clsx('display-sm leading-none', config.labelColor)}>{config.label}</p>
      </div>
    </div>
  );
}

export function Podium({ entries, currentUserId }: Props) {
  const [first, second, third] = [entries[0], entries[1], entries[2]];
  const [quote] = useState(() => sueFor('top3-header'));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-el-3 border border-gray-100/80 p-5">
      {/* Gold halo behind #1 (the eye-catching glow) */}
      <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 w-44 h-44 bg-gold/25 rounded-full blur-3xl" />
      <p className="relative font-body text-xs italic text-navy/55 text-center mb-4 px-4 balanced">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="relative flex items-end gap-2">
        <PodiumSpot entry={second} rank={2} isCurrentUser={second?.id === currentUserId} />
        <PodiumSpot entry={first} rank={1} isCurrentUser={first?.id === currentUserId} />
        <PodiumSpot entry={third} rank={3} isCurrentUser={third?.id === currentUserId} />
      </div>
    </div>
  );
}
