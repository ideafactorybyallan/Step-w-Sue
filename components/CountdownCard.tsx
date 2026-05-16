import { getDaysRemaining, getDaysUntilStart, isChallengeStarted, isChallengeOver, getCurrentWeekNumber } from '@/lib/dates';
import { CrownMark } from './marks';

interface ShellProps {
  label: string;
  number: number | string;
  suffix: string;
  caption: string;
  finalStretch?: boolean;
  done?: boolean;
}

function CountdownShell({ label, number, suffix, caption, finalStretch, done }: ShellProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-navy shadow-el-4 ${
        finalStretch || done ? '[box-shadow:0_16px_48px_-4px_rgba(27,47,94,0.22),0_0_40px_rgba(245,197,24,0.35)]' : ''
      }`}
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sw-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sw-teal/15 rounded-full blur-3xl pointer-events-none" />
      {(finalStretch || done) && (
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold/20 rounded-full blur-3xl pointer-events-none" />
      )}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

      <div className="relative px-6 py-7 text-center">
        <p className="font-body text-sw-teal text-xs font-semibold uppercase tracking-[0.25em] mb-2">
          {label}
        </p>
        {done ? (
          <CrownMark className="w-16 h-12 mx-auto mb-1 [filter:drop-shadow(0_4px_12px_rgba(245,197,24,0.5))]" />
        ) : (
          <div className="flex items-baseline justify-center gap-2">
            <p className="display-hero text-white drop-shadow-sm">{number}</p>
            <p className="display-md text-sw-pink">{suffix}</p>
          </div>
        )}
        {done && (
          <p className="display-md text-gold-light leading-none mt-1">{suffix}</p>
        )}
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
        number=""
        suffix="DONE"
        caption="Thanks for competing — see you next year."
        done
      />
    );
  }

  if (!isChallengeStarted()) {
    return (
      <CountdownShell
        label="Challenge Starts In"
        number={getDaysUntilStart()}
        suffix="DAYS"
        caption="May 18, 2026 · Victoria Day weekend"
      />
    );
  }

  const finalStretch = getCurrentWeekNumber() === 4;

  return (
    <CountdownShell
      label={finalStretch ? 'Final Stretch' : 'Days Remaining'}
      number={getDaysRemaining()}
      suffix={finalStretch ? 'TO GLORY' : 'DAYS LEFT'}
      caption={finalStretch ? 'Last lap. Make it count.' : 'Ends June 14 · keep going.'}
      finalStretch={finalStretch}
    />
  );
}
