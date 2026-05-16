// Brand mark library — handcrafted SVGs that replace generic emoji.
// All marks: 1em sized by default, accept className for color/sizing,
// use currentColor where appropriate, no external deps.

interface MarkProps {
  className?: string;
  'aria-hidden'?: boolean;
}

// ── Sue mark ────────────────────────────────────────────────────────────
// Abstract "S" monogram inside a teal disc. Default variant looks forward,
// "wave" variant tilts slightly (used on the Monday banner).
export function SueMark({ className, variant = 'default' }: MarkProps & { variant?: 'default' | 'wave' }) {
  const tilt = variant === 'wave' ? 'rotate(-8deg)' : undefined;
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      style={{ transform: tilt, transformOrigin: 'center' }}
    >
      <defs>
        <linearGradient id="sue-disc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4CD6C8" />
          <stop offset="100%" stopColor="#1A9B8E" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#sue-disc)" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      {/* Geometric "S" — Bebas-influenced, squared shoulders */}
      <path
        d="M27 13 L14.5 13 Q12 13 12 15.5 L12 18.5 Q12 21 14.5 21 L25.5 21 Q28 21 28 23.5 L28 26.5 Q28 29 25.5 29 L13 29"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

// ── Footprint mark ──────────────────────────────────────────────────────
// Two stylized foot shapes overlapping. Replaces 👟.
export function FootprintMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="currentColor">
      {/* Back foot */}
      <ellipse cx="6" cy="12.5" rx="3" ry="4.5" />
      <circle cx="4" cy="6.5" r="1.3" />
      <circle cx="6.5" cy="5" r="1.1" />
      <circle cx="8.6" cy="6" r="0.9" />
      {/* Front foot (slightly offset) */}
      <ellipse cx="14" cy="9.5" rx="2.7" ry="4" opacity="0.7" />
      <circle cx="12.3" cy="4" r="1.1" opacity="0.7" />
      <circle cx="14.5" cy="2.8" r="0.95" opacity="0.7" />
      <circle cx="16.4" cy="3.6" r="0.8" opacity="0.7" />
    </svg>
  );
}

// ── Medal mark ──────────────────────────────────────────────────────────
// Disc with ribbon, metallic gradients per rank. Replaces 🥇🥈🥉.
export function MedalMark({ rank, className }: MarkProps & { rank: 1 | 2 | 3 }) {
  const gradients = {
    1: { id: 'medal-gold',   light: '#FFE066', mid: '#F5C518', dark: '#B88A00', ribbon: '#C01A38' },
    2: { id: 'medal-silver', light: '#F3F4F6', mid: '#C7CCD3', dark: '#7F8693', ribbon: '#374151' },
    3: { id: 'medal-bronze', light: '#E2A678', mid: '#B16A3E', dark: '#7A4423', ribbon: '#1B2F5E' },
  };
  const g = gradients[rank];
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${g.id}-disc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g.light} />
          <stop offset="50%" stopColor={g.mid} />
          <stop offset="100%" stopColor={g.dark} />
        </linearGradient>
        <radialGradient id={`${g.id}-shine`} cx="0.35" cy="0.3" r="0.4">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Ribbon */}
      <path d="M7 0 L9.5 10 L14.5 10 L17 0 Z" fill={g.ribbon} />
      <path d="M7 0 L9 6 L11 0 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M17 0 L15 6 L13 0 Z" fill="rgba(0,0,0,0.18)" />
      {/* Disc */}
      <circle cx="12" cy="18" r="9" fill={`url(#${g.id}-disc)`} />
      <circle cx="12" cy="18" r="9" fill={`url(#${g.id}-shine)`} />
      <circle cx="12" cy="18" r="9" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      {/* Inner ring */}
      <circle cx="12" cy="18" r="6" fill="none" stroke={g.dark} strokeWidth="0.6" opacity="0.5" />
      {/* Rank numeral */}
      <text
        x="12"
        y="21.5"
        textAnchor="middle"
        fontFamily="var(--font-bebas), system-ui, sans-serif"
        fontSize="9"
        fill={rank === 1 ? '#1B2F5E' : 'white'}
        fontWeight="400"
      >
        {rank}
      </text>
    </svg>
  );
}

// ── Crown mark ──────────────────────────────────────────────────────────
// Angular crown. Replaces 👑 in winner contexts.
export function CrownMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 20" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="crown-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD84D" />
          <stop offset="100%" stopColor="#D4A800" />
        </linearGradient>
      </defs>
      <path
        d="M2 17 L4 5 L8 11 L12 3 L16 11 L20 5 L22 17 Z"
        fill="url(#crown-fill)"
        stroke="#B88A00"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <rect x="2" y="16.5" width="20" height="2.5" fill="#B88A00" rx="0.3" />
      <circle cx="4" cy="5" r="1.1" fill="#FFE066" />
      <circle cx="12" cy="3" r="1.1" fill="#FFE066" />
      <circle cx="20" cy="5" r="1.1" fill="#FFE066" />
      <circle cx="8" cy="13" r="0.6" fill="#C01A38" />
      <circle cx="16" cy="13" r="0.6" fill="#C01A38" />
    </svg>
  );
}

// ── Lock mark ───────────────────────────────────────────────────────────
// Chunky padlock. Replaces 🔒.
export function LockMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 20 22" className={className} aria-hidden="true" fill="currentColor">
      <path
        d="M5 9 L5 6 Q5 2 10 2 Q15 2 15 6 L15 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect x="3" y="9" width="14" height="11" rx="2.5" />
      <circle cx="10" cy="14" r="1.6" fill="rgba(0,0,0,0.25)" />
      <rect x="9.2" y="14.5" width="1.6" height="3" rx="0.5" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
}

// ── Sparkle mark ────────────────────────────────────────────────────────
// 4-point star burst. Used for PB / milestone moments.
export function SparkleMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 1 L13.5 9 L21 12 L13.5 15 L12 23 L10.5 15 L3 12 L10.5 9 Z" />
      <circle cx="20" cy="4" r="1.2" opacity="0.7" />
      <circle cx="4" cy="20" r="1" opacity="0.5" />
      <circle cx="21" cy="19" r="0.7" opacity="0.4" />
    </svg>
  );
}

// ── Flame mark ──────────────────────────────────────────────────────────
// Streak indicator. Replaces 🔥.
export function FlameMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 20 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="flame-fill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E8234A" />
          <stop offset="60%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#FFE066" />
        </linearGradient>
      </defs>
      <path
        d="M10 1 Q6 6 5 11 Q4 14 6 16 Q4 17 4 19 Q4 23 10 23 Q16 23 16 19 Q16 17 14 16 Q16 14 15 11 Q14 6 10 1 Z"
        fill="url(#flame-fill)"
      />
      <path
        d="M10 8 Q8 12 8 14 Q8 17 10 17 Q12 17 12 14 Q12 12 10 8 Z"
        fill="rgba(255,255,255,0.6)"
      />
    </svg>
  );
}
