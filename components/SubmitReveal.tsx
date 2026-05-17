'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { ConfettiEffect } from './ConfettiEffect';
import { CrownMark, SparkleMark, FootprintMark, LockMark } from './marks';
import { sueFor, type SueContext } from '@/lib/sue-says';
import { getWeekStatus } from '@/lib/dates';
import type { WeeklySubmission } from '@/lib/types';

interface Props {
  open: boolean;
  submittedTotal: number;
  weekNumber: number;
  allSubmissions: WeeklySubmission[];
  isLate: boolean;
  onDismiss: () => void;
  onSelectWeek?: (week: number) => void;
}

type Phase = 'submitting' | 'count' | 'rank' | 'sue' | 'done';

export function SubmitReveal({ open, submittedTotal, weekNumber, allSubmissions, isLate, onDismiss, onSelectWeek }: Props) {
  const [phase, setPhase] = useState<Phase>('submitting');
  const [displayCount, setDisplayCount] = useState(0);

  // Compute moment-of-truth context from the user's own history
  const insights = useMemo(() => {
    const priors = allSubmissions.filter((s) => s.week_number !== weekNumber);
    const priorTotals = priors.map((s) => s.total_steps).filter((n) => n > 0);
    const priorMax = priorTotals.length ? Math.max(...priorTotals) : 0;
    const priorAvg = priorTotals.length
      ? Math.round(priorTotals.reduce((a, b) => a + b, 0) / priorTotals.length)
      : 0;
    const isPB = priorMax > 0 && submittedTotal > priorMax;
    const isFirstWeek = priorTotals.length === 0;
    const delta = priorAvg > 0 ? submittedTotal - priorAvg : 0;
    const submittedWeeks = priors.filter((s) => s.total_steps > 0).length + 1;

    // Consecutive streak ending at this week
    const submittedWeekNums = new Set(allSubmissions.filter((s) => s.total_steps > 0).map((s) => s.week_number));
    submittedWeekNums.add(weekNumber);
    let streak = 1;
    let w = weekNumber - 1;
    while (w >= 1 && submittedWeekNums.has(w)) { streak++; w--; }

    return { isPB, isFirstWeek, delta, priorAvg, submittedWeeks, streak };
  }, [allSubmissions, weekNumber, submittedTotal]);

  // Phase sequencing
  useEffect(() => {
    if (!open) {
      setPhase('submitting');
      setDisplayCount(0);
      return;
    }
    const t1 = setTimeout(() => setPhase('count'), 250);
    const t2 = setTimeout(() => setPhase('rank'), 1700);
    const t3 = setTimeout(() => setPhase('sue'), 2700);
    const t4 = setTimeout(() => setPhase('done'), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [open]);

  // Count-up animation for the step total
  useEffect(() => {
    if (phase !== 'count' && phase !== 'rank' && phase !== 'sue' && phase !== 'done') {
      setDisplayCount(0);
      return;
    }
    if (phase !== 'count') {
      setDisplayCount(submittedTotal);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayCount(Math.round(submittedTotal * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, submittedTotal]);

  // Lock body scroll while the reveal is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const sueCtx: SueContext = insights.isPB
    ? 'success-pb'
    : insights.delta > 0
    ? 'success-climbed'
    : isLate
    ? 'late-submit'
    : 'success-default';
  const sueQuote = sueFor(sueCtx);

  const nextWeek = weekNumber + 1;
  const nextWeekUnlocked = nextWeek <= 4 && getWeekStatus(nextWeek) !== 'upcoming';

  return (
    <div className="fixed inset-0 z-[60] bg-hero-navy-tight flex flex-col items-center justify-between px-6 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] animate-scrim-rise overflow-hidden">
      <ConfettiEffect trigger={phase === 'count' || phase === 'rank'} />
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-sw-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-sw-teal/15 rounded-full blur-3xl pointer-events-none" />
      {insights.isPB && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gold/25 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Dismiss button — always available from phase count onward */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white active:scale-[0.88] transition-all duration-150 flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>

      {/* Top section: hero mark + caption */}
      <div className="relative w-full flex flex-col items-center pt-8">
        {phase !== 'submitting' && (
          <div className="animate-pop-in">
            {insights.isPB ? (
              <SparkleMark className="w-16 h-16 text-gold [filter:drop-shadow(0_4px_16px_rgba(245,197,24,0.6))]" />
            ) : insights.submittedWeeks === 4 ? (
              <CrownMark className="w-16 h-14 [filter:drop-shadow(0_4px_16px_rgba(245,197,24,0.6))]" />
            ) : (
              <LockMark className="w-14 h-14 text-sw-teal [filter:drop-shadow(0_4px_16px_rgba(43,184,170,0.6))]" />
            )}
          </div>
        )}
        <p className="font-body text-sw-teal text-[10px] font-bold tracking-[0.3em] uppercase mt-4">
          {insights.isPB ? 'Personal Best' : isLate ? 'Late · but counted' : 'Locked In'}
        </p>
        <p className="display-sm text-white/85 mt-1">WEEK {weekNumber}</p>
      </div>

      {/* Middle: animated step count */}
      <div className="relative flex flex-col items-center">
        <p
          className="display-hero text-white text-center tabular-nums [text-shadow:0_4px_24px_rgba(255,255,255,0.15)]"
          style={{ fontSize: 'clamp(64px, 18vw, 96px)' }}
        >
          {displayCount.toLocaleString()}
        </p>
        <p className="font-body text-white/65 text-sm mt-1 inline-flex items-center gap-1.5">
          <FootprintMark className="w-3.5 h-3.5 text-white/55" /> steps
        </p>

        {/* Rank/delta phase */}
        {(phase === 'rank' || phase === 'sue' || phase === 'done') && (
          <div className="mt-6 flex flex-col items-center gap-2 animate-fade-up">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {insights.isPB && (
                <div className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/40 rounded-full px-3 py-1.5">
                  <SparkleMark className="w-3.5 h-3.5 text-gold" />
                  <span className="font-body text-gold-light font-bold text-xs tracking-wider uppercase">
                    Personal Best
                  </span>
                </div>
              )}
              {insights.streak >= 2 && (
                <div className="inline-flex items-center gap-1.5 bg-sw-pink/20 border border-sw-pink/40 rounded-full px-3 py-1.5">
                  <span className="text-xs">🔥</span>
                  <span className="font-body text-sw-pink font-bold text-xs tracking-wider uppercase">
                    {insights.streak}-Week Streak
                  </span>
                </div>
              )}
            </div>
            {insights.isFirstWeek ? (
              <p className="font-body text-white/70 text-sm text-center max-w-xs">
                Your first week is in the books. Three to go.
              </p>
            ) : insights.delta > 0 ? (
              <p className="font-body text-white/70 text-sm text-center max-w-xs">
                <span className="text-sw-teal font-semibold tabular-nums">
                  +{insights.delta.toLocaleString()}
                </span>{' '}
                above your weekly average
              </p>
            ) : insights.delta < 0 ? (
              <p className="font-body text-white/55 text-sm text-center max-w-xs">
                <span className="tabular-nums">{Math.abs(insights.delta).toLocaleString()}</span>{' '}
                below your weekly average — keep climbing.
              </p>
            ) : null}
            <p className="font-body text-white/50 text-xs mt-1">
              {insights.submittedWeeks}/4 weeks locked in
            </p>
          </div>
        )}

        {/* Sue speaks */}
        {(phase === 'sue' || phase === 'done') && (
          <div className="mt-6 max-w-xs w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3 animate-slide-up-in">
            <p className="font-body text-sw-teal text-[10px] font-bold tracking-[0.3em] uppercase mb-1">
              Sue Says
            </p>
            <p className="font-body italic text-white text-sm leading-relaxed">
              &ldquo;{sueQuote}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Bottom: action footer */}
      <div className="relative w-full flex flex-col items-center gap-2.5 min-h-[120px] justify-end">
        {phase === 'done' && (
          <div className="w-full flex flex-col items-stretch gap-2 animate-slide-up-in">
            {nextWeekUnlocked ? (
              <button
                onClick={() => {
                  onSelectWeek?.(nextWeek);
                  onDismiss();
                }}
                className="w-full bg-gradient-pink text-white font-display text-xl rounded-2xl py-3.5 shadow-el-3 active:scale-[0.96] transition-transform duration-150 ease-spring inline-flex items-center justify-center gap-1"
              >
                NEXT: WEEK {nextWeek}
                <ChevronRight size={20} />
              </button>
            ) : (
              <Link
                href="/home"
                className="w-full bg-gradient-pink text-white font-display text-xl rounded-2xl py-3.5 shadow-el-3 active:scale-[0.96] transition-transform duration-150 ease-spring inline-flex items-center justify-center gap-1"
              >
                BACK TO HOME
                <ChevronRight size={20} />
              </Link>
            )}
            <Link
              href="/leaderboard"
              className="w-full border border-white/30 text-white font-body font-semibold text-sm rounded-2xl py-3 active:scale-[0.96] transition-transform duration-150 ease-spring inline-flex items-center justify-center gap-1"
            >
              See the standings <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
