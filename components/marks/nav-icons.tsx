// Bespoke nav icons — replace generic Lucide Home/Trophy/Footprints.
// Each is 22px viewBox-square, stroke-based so they respond to strokeWidth,
// currentColor-aware. Press feel and active state stay in BottomNav.tsx.

interface NavIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// Home — arched doorway with a step trail underneath.
// Reads as "starting point" with a subtle nod to the walking theme.
export function HomeNavIcon({ size = 22, strokeWidth = 1.8, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11 L12 3 L21 11 V20 Q21 21 20 21 H4 Q3 21 3 20 Z" />
      <path d="M9 21 V14 Q9 13 10 13 H14 Q15 13 15 14 V21" />
      <circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Standings — three stacked bars (a podium silhouette).
export function StandingsNavIcon({ size = 22, strokeWidth = 1.8, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Center podium (tallest) */}
      <rect x="9" y="6" width="6" height="15" rx="1" />
      {/* Left (medium) */}
      <rect x="3" y="11" width="6" height="10" rx="1" />
      {/* Right (shortest) */}
      <rect x="15" y="14" width="6" height="7" rx="1" />
      {/* Star on top of center */}
      <path d="M12 3 L12.9 4.8 L14.8 5 L13.4 6.3 L13.8 8.2 L12 7.2 L10.2 8.2 L10.6 6.3 L9.2 5 L11.1 4.8 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// My Steps — a footprint trail (curved path with two feet).
export function StepsNavIcon({ size = 22, strokeWidth = 1.8, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Back foot (lower-left) */}
      <ellipse cx="7.5" cy="16" rx="2.2" ry="3.2" transform="rotate(-15 7.5 16)" fill="currentColor" stroke="none" />
      <circle cx="5.6" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="10.4" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="11" r="0.6" fill="currentColor" stroke="none" />
      {/* Front foot (upper-right) */}
      <ellipse cx="16" cy="9" rx="2" ry="3" transform="rotate(15 16 9)" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="14.5" cy="4.5" r="0.7" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="16.4" cy="3.5" r="0.65" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="18.1" cy="4.2" r="0.55" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}
