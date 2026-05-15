import { getDaysRemaining, getDaysUntilStart, isChallengeStarted, isChallengeOver } from '@/lib/dates';

interface ShellProps {
  label: string;
  number: number | string;
  suffix: string;
  caption: string;
}

function CountdownShell({ label, number, suffix, caption }: ShellProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-navy shadow-card-lg">
      {/* Decorative glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sw-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sw-teal/15 rounded-full blur-3xl pointer-events-none" />

      {/* Inner border shine */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

      <div className="relative px-6 py-7 text-center">
        <p className="font-body text-sw-teal text-xs font-semibold uppercase tracking-[0.25em] mb-2">
          {label}
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <p className="font-display text-white text-8xl leading-none drop-shadow-sm">{number}</p>
          <p className="font-display text-sw-pink text-3xl leading-none">{suffix}</p>
        </div>
        <p className="font-body text-white/70 text-xs mt-3">{caption}</p>
      </div>
    </div>
  );
}

export function CountdownCard() {
  if (isChallengeOver()) {
    return (
      <CountdownShell
        label="Challenge Status"
        number="🏆"
        suffix="DONE"
        caption="Thanks for competing — see you next year!"
      />
    );
  }

  if (!isChallengeStarted()) {
    return (
      <CountdownShell
        label="Challenge Starts In"
        number={getDaysUntilStart()}
        suffix="DAYS"
        caption="May 18, 2026 — get those shoes ready! 👟"
      />
    );
  }

  return (
    <CountdownShell
      label="Days Remaining"
      number={getDaysRemaining()}
      suffix="DAYS LEFT"
      caption="Ends June 14 — keep stepping! 👟"
    />
  );
}
