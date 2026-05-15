import { Card } from './ui/Card';
import { getDaysRemaining, getDaysUntilStart, isChallengeStarted, isChallengeOver } from '@/lib/dates';

export function CountdownCard() {
  if (isChallengeOver()) {
    return (
      <Card className="bg-navy text-center">
        <p className="font-display text-white text-3xl">CHALLENGE COMPLETE!</p>
        <p className="font-body text-white/70 text-sm mt-1">
          Thanks for competing — see you next year! 🏆
        </p>
      </Card>
    );
  }

  if (!isChallengeStarted()) {
    const days = getDaysUntilStart();
    return (
      <Card className="bg-navy text-center">
        <p className="font-body text-sw-teal text-xs font-semibold uppercase tracking-widest mb-1">
          Challenge Starts In
        </p>
        <p className="font-display text-white text-6xl leading-none">{days}</p>
        <p className="font-display text-sw-pink text-2xl">DAYS</p>
        <p className="font-body text-white/60 text-xs mt-1">May 18, 2026 — get those shoes ready!</p>
      </Card>
    );
  }

  const days = getDaysRemaining();
  return (
    <Card className="bg-navy text-center">
      <p className="font-body text-sw-teal text-xs font-semibold uppercase tracking-widest mb-1">
        Days Remaining
      </p>
      <p className="font-display text-white text-6xl leading-none">{days}</p>
      <p className="font-display text-sw-pink text-2xl">DAYS LEFT</p>
      <p className="font-body text-white/60 text-xs mt-1">Ends June 14 — keep stepping! 👟</p>
    </Card>
  );
}
