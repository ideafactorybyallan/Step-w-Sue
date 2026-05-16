'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SubmitReveal } from './SubmitReveal';
import { LockMark, FootprintMark } from './marks';
import {
  getDaysInWeek, getDayName, formatDate, formatDateShort,
  getWeekStatus, isLateSubmission, WEEKS,
} from '@/lib/dates';
import { clsx } from 'clsx';
import type { WeeklySubmission, DailyStep } from '@/lib/types';

interface Props {
  weekNumber: number;
  submission: WeeklySubmission | null;
  userId: string;
  previewMode?: boolean;
  allSubmissions?: WeeklySubmission[];
  onSelectWeek?: (week: number) => void;
}

type EntryMode = 'daily' | 'weekly';

const MAX_DAILY = 100_000;
const MAX_WEEKLY = 200_000;

function totalBgClasses(total: number): string {
  if (total >= 100_000) return 'bg-gradient-sunset text-white';
  if (total >= 50_000) return 'bg-gradient-pink text-white';
  return 'bg-white text-navy';
}

function totalContextLine(total: number, isLocked: boolean): string {
  if (isLocked) return '✓ Submitted';
  if (total === 0) return 'Start logging to watch this grow.';
  if (total >= 100_000) return 'Hundred-K club. Sue is impressed.';
  if (total >= 70_000) return 'Strong week shaping up.';
  if (total >= 40_000) return 'Solid. Keep going.';
  return 'Every step counts.';
}

export function StepEntryWeek({
  weekNumber,
  submission,
  userId,
  previewMode = false,
  allSubmissions = [],
  onSelectWeek,
}: Props) {
  const week = WEEKS[weekNumber - 1];
  const days = getDaysInWeek(weekNumber);
  const status = getWeekStatus(weekNumber);
  const isLate = isLateSubmission(weekNumber);

  const DRAFT_KEY = `swc_draft_week_${weekNumber}_${userId}`;

  const router = useRouter();
  const [mode, setMode] = useState<EntryMode>('daily');
  const [dailySteps, setDailySteps] = useState<Record<string, string>>({});
  const [weeklyTotal, setWeeklyTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [error, setError] = useState('');
  const [revealOpen, setRevealOpen] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [pendingSubmission, setPendingSubmission] = useState<WeeklySubmission | null>(null);
  const [savedDates, setSavedDates] = useState<Record<string, number>>({}); // date -> timestamp of last successful save
  const weekCache = useRef<Map<number, DailyStep[]>>(new Map());

  // Reset pending submission whenever we switch to a new week
  useEffect(() => {
    setPendingSubmission(null);
    setRevealOpen(false);
  }, [weekNumber]);

  useEffect(() => {
    const loadData = async () => {
      if (previewMode) return;
      try {
        let data: DailyStep[];
        if (weekCache.current.has(weekNumber)) {
          data = weekCache.current.get(weekNumber)!;
        } else {
          const res = await fetch(`/api/steps?week=${weekNumber}`);
          if (!res.ok) return;
          data = await res.json();
          weekCache.current.set(weekNumber, data);
        }
        const fromDB: Record<string, string> = {};
        data.forEach((s) => { fromDB[s.entry_date] = String(s.steps); });
        const draft = localStorage.getItem(DRAFT_KEY);
        const merged = draft ? { ...fromDB, ...JSON.parse(draft) } : fromDB;
        setDailySteps(merged);
      } catch {/* non-critical */}
    };
    loadData();
  }, [weekNumber, DRAFT_KEY, previewMode]);

  // Auto-clear save error after 4 seconds
  useEffect(() => {
    if (!saveError) return;
    const t = setTimeout(() => setSaveError(''), 4000);
    return () => clearTimeout(t);
  }, [saveError]);

  const dailySum = days.reduce((sum, d) => sum + (parseInt(dailySteps[d] || '0') || 0), 0);
  const totalForSubmit = mode === 'daily' ? dailySum : parseInt(weeklyTotal || '0') || 0;

  // Validation
  const dailyHasError = days.some((d) => {
    const v = parseInt(dailySteps[d] || '0');
    return v > MAX_DAILY;
  });
  const weeklyHasError = parseInt(weeklyTotal || '0') > MAX_WEEKLY;
  const hasInputError = mode === 'daily' ? dailyHasError : weeklyHasError;

  const saveDraft = useCallback((updated: Record<string, string>) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  }, [DRAFT_KEY]);

  const handleDayChange = (date: string, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const next = { ...dailySteps, [date]: cleaned };
    setDailySteps(next);
    saveDraft(next);
  };

  const handleSaveDayToDb = async (date: string) => {
    if (previewMode) return;
    const steps = parseInt(dailySteps[date] || '0');
    if (isNaN(steps) || steps > MAX_DAILY) return;
    setSaveLoading(true);
    setSaveError('');
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_date: date, steps }),
      });
      if (!res.ok) {
        setSaveError('❌ Couldn’t save — tap to try again');
      } else {
        setSavedDates((prev) => ({ ...prev, [date]: Date.now() }));
      }
    } catch {
      setSaveError('❌ Couldn’t save — check your connection');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleModeSwitch = (newMode: EntryMode) => {
    if (newMode === 'weekly' && mode === 'daily' && dailySum > 0 && !weeklyTotal) {
      setWeeklyTotal(String(dailySum));
    }
    setMode(newMode);
  };

  const handleSubmit = async () => {
    if (previewMode) return;
    if (totalForSubmit === 0) {
      setError('Please enter your steps before submitting.');
      return;
    }
    if (hasInputError) {
      setError(mode === 'daily' ? `Daily steps can’t exceed ${MAX_DAILY.toLocaleString()}.` : `Weekly total can’t exceed ${MAX_WEEKLY.toLocaleString()}.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_number: weekNumber, total_steps: totalForSubmit }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      weekCache.current.delete(weekNumber);
      setSubmittedAmount(totalForSubmit);
      setPendingSubmission({
        id: 'pending',
        participant_id: userId,
        week_number: weekNumber,
        total_steps: totalForSubmit,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_late: isLate,
        is_locked: false,
      });
      setRevealOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const effectiveSubmission = submission ?? pendingSubmission;

  const handleRevealDismiss = () => {
    setRevealOpen(false);
    // Reconcile with server state so the rest of the app (leaderboard, home) reflects the new submission.
    router.refresh();
  };

  // ── Locked state — trophy case
  if (!previewMode && effectiveSubmission?.is_locked) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-light/30 via-white to-gold/10 border-2 border-gold/40 shadow-el-3 p-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, rgba(245,197,24,0.25) 0, transparent 12px), radial-gradient(circle at 80% 70%, rgba(245,197,24,0.20) 0, transparent 10px), radial-gradient(circle at 50% 90%, rgba(245,197,24,0.15) 0, transparent 8px)',
          }}
        />
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gold/25 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <LockMark className="w-12 h-12 text-gold-dark mx-auto mb-2 [filter:drop-shadow(0_3px_10px_rgba(212,168,0,0.4))]" />
          <p className="font-body text-xs font-bold text-gold-dark uppercase tracking-[0.25em] mb-1">
            Week {weekNumber} Locked In
          </p>
          <p className="display-hero text-gold-dark leading-[0.85] mt-1">
            {effectiveSubmission.total_steps.toLocaleString()}
          </p>
          <p className="font-body text-xs text-navy/55 mt-1 inline-flex items-center gap-1 justify-center">
            <FootprintMark className="w-3 h-3" /> steps · official record
          </p>
          {effectiveSubmission.is_late && (
            <p className="font-body text-xs text-orange-500 mt-2.5">⏰ Submitted late</p>
          )}
          <p className="font-body text-xs text-gray-500 mt-3 italic">
            &ldquo;Locked in. On to next week&rsquo;s chaos.&rdquo;
          </p>
        </div>
      </div>
    );
  }

  // ── Submitted (not locked yet)
  if (!previewMode && effectiveSubmission && !revealOpen) {
    return (
      <Card className="shadow-el-2">
        <div className="text-center py-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sw-teal/15 mb-2">
            <LockMark className="w-7 h-7 text-sw-teal-dark" />
          </div>
          <p className="display-sm text-navy">WEEK {weekNumber} SUBMITTED</p>
          <div className="mt-4 bg-sw-teal/10 border border-sw-teal/20 rounded-2xl p-4">
            <p className="display-xl text-sw-teal-dark leading-none">
              {effectiveSubmission.total_steps.toLocaleString()}
            </p>
            <p className="font-body text-xs text-gray-500 mt-1">steps submitted</p>
            {effectiveSubmission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1.5">⏰ Submitted late</p>
            )}
            <p className="font-body text-xs text-gray-400 mt-2">
              Submitted {formatDateShort(effectiveSubmission.submitted_at.split('T')[0])}
            </p>
          </div>
          <p className="font-body text-xs text-gray-400 mt-4">
            Need to change it? Ask the admin to unlock this week.
          </p>
        </div>
      </Card>
    );
  }

  // ── Upcoming week
  if (!previewMode && status === 'upcoming') {
    const daysUntilStart = Math.ceil(
      (new Date(week.start).getTime() - Date.now()) / 86400000
    );
    return (
      <Card className="border-2 border-dashed border-navy/20 shadow-el-1">
        <div className="text-center py-5">
          <p className="font-body text-xs font-bold text-navy/55 uppercase tracking-[0.25em] mb-1">
            Week {weekNumber} starts in
          </p>
          <p className="display-hero text-navy/85 leading-[0.85]">{daysUntilStart}</p>
          <p className="display-sm text-navy/55 mt-1">{daysUntilStart === 1 ? 'DAY' : 'DAYS'}</p>
          <p className="font-body text-sm text-gray-500 mt-2">
            Starts {formatDate(week.start)} — tie those shoes.
          </p>
        </div>
      </Card>
    );
  }

  // ── Entry form
  const today = new Date().toISOString().split('T')[0];
  const deadlineDisplay = formatDate(week.deadline);
  const daysUntilDeadline = Math.ceil(
    (new Date(week.deadline).getTime() - Date.now()) / 86400000
  );
  const deadlineIsUrgent = daysUntilDeadline <= 2 && !isLate;

  // Compute per-day deltas vs the previous day for momentum cues
  const dayDeltas: Record<string, number> = {};
  days.forEach((d, i) => {
    if (i === 0) return;
    const prev = parseInt(dailySteps[days[i - 1]] || '0') || 0;
    const curr = parseInt(dailySteps[d] || '0') || 0;
    if (prev > 0 && curr > 0) {
      dayDeltas[d] = Math.round(((curr - prev) / prev) * 100);
    }
  });

  return (
    <Card className="shadow-el-2">
      <div className="flex items-baseline gap-2 mb-1">
        <p className="display-sm text-navy">WEEK {weekNumber}</p>
        <p className="font-body text-sm text-gray-400">
          {formatDate(week.start)} – {formatDate(week.end)}
        </p>
      </div>

      {/* Deadline / preview banner */}
      {previewMode ? (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-body font-medium bg-navy/5 border border-navy/10 text-navy/50">
          <LockMark className="w-3.5 h-3.5" />
          <span>Preview only — step submission opens May 18</span>
        </div>
      ) : !isLate ? (
        <div className={clsx(
          'flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-body font-medium',
          deadlineIsUrgent
            ? 'bg-orange-50 border border-orange-200 text-orange-700'
            : 'bg-gray-50 border border-gray-200 text-gray-500'
        )}>
          <span>{deadlineIsUrgent ? '⏰' : '📬'}</span>
          <span>Submit by {deadlineDisplay} at midnight EDT</span>
          {deadlineIsUrgent && <span className="ml-auto font-semibold">Soon!</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-body font-medium bg-orange-50 border border-orange-200 text-orange-700">
          <span>⏰</span>
          <span>Deadline passed ({deadlineDisplay}) — this will be marked as <strong>late</strong></span>
        </div>
      )}

      {/* Sliding segmented control */}
      <div className="relative flex bg-gray-100 rounded-xl p-1 mb-5">
        <div
          className="absolute inset-1 rounded-lg bg-white shadow-el-1 transition-transform duration-200 ease-out"
          style={{
            width: 'calc(50% - 2px)',
            transform: mode === 'weekly' ? 'translateX(calc(100% + 2px))' : 'translateX(0)',
          }}
        />
        {(['daily', 'weekly'] as EntryMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={clsx(
              'relative z-10 flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition-all duration-150 active:scale-[0.96]',
              mode === m ? 'text-navy' : 'text-gray-400'
            )}
          >
            {m === 'daily' ? 'Daily' : 'Weekly total'}
          </button>
        ))}
      </div>

      {mode === 'daily' ? (
        <div className="space-y-2 stagger-children">
          {days.map((date) => {
            const dayName = getDayName(date);
            const dateStr = formatDate(date);
            const isToday = date === today;
            const dayVal = parseInt(dailySteps[date] || '0');
            const dayError = dayVal > MAX_DAILY;
            const recentlySaved = savedDates[date] && Date.now() - savedDates[date] < 2500;
            const delta = dayDeltas[date];

            return (
              <div
                key={date}
                className={clsx(
                  'rounded-xl p-3 border-l-2 transition-colors',
                  isToday
                    ? 'bg-white border-sw-teal shadow-el-1 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.6),0_2px_8px_rgba(43,184,170,0.10)]'
                    : 'bg-white border-transparent shadow-el-1'
                )}
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="inline-flex items-baseline gap-2">
                    <span className={clsx('display-xs', isToday ? 'text-sw-teal-dark' : 'text-navy')}>
                      {dayName.toUpperCase()}
                    </span>
                    <span className="font-body text-xs text-gray-400">{dateStr}</span>
                    {isToday && (
                      <span className="font-body text-[9px] font-bold text-sw-teal tracking-[0.18em] uppercase">
                        Today
                      </span>
                    )}
                  </div>
                  {recentlySaved && (
                    <span className="font-body text-[10px] text-sw-teal-dark font-semibold animate-fade-up">
                      ✓ saved
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={dailySteps[date] ?? ''}
                    onChange={(e) => handleDayChange(date, e.target.value)}
                    onBlur={() => handleSaveDayToDb(date)}
                    className={clsx(
                      'w-full border rounded-xl px-3 py-2.5 font-display text-2xl tabular-nums focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-150',
                      dayError
                        ? 'border-orange-300 bg-orange-50 text-orange-600 focus:border-orange-400 focus:ring-orange-300/30'
                        : isToday
                        ? 'border-sw-teal/30 bg-white text-navy focus:border-sw-teal focus:ring-sw-teal/25'
                        : 'border-gray-200 bg-white text-navy focus:border-sw-teal focus:ring-sw-teal/25'
                    )}
                    min="0"
                    max={MAX_DAILY}
                  />
                </div>

                {(dayError || (typeof delta === 'number' && Math.abs(delta) >= 5)) && (
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    {dayError ? (
                      <p className="text-[10px] text-orange-600 font-medium">
                        Max {MAX_DAILY.toLocaleString()}/day — easy there.
                      </p>
                    ) : typeof delta === 'number' && delta > 0 ? (
                      <p className="text-[10px] text-sw-teal-dark font-medium">
                        ↑ {delta}% vs yesterday
                      </p>
                    ) : typeof delta === 'number' && delta < 0 ? (
                      <p className="text-[10px] text-gray-400 font-medium">
                        ↓ {Math.abs(delta)}% vs yesterday
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}

          {/* Weekly total panel — grows in visual weight with magnitude */}
          <div
            className={clsx(
              'mt-4 rounded-2xl p-4 transition-all duration-300 shadow-el-2 relative overflow-hidden',
              totalBgClasses(dailySum)
            )}
          >
            {dailySum >= 50_000 && (
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="relative flex items-end justify-between">
              <div>
                <p
                  className={clsx(
                    'font-body text-[10px] font-bold uppercase tracking-[0.25em]',
                    dailySum >= 50_000 ? 'text-white/85' : 'text-gray-400'
                  )}
                >
                  This Week
                </p>
                <p
                  className={clsx(
                    'font-body text-xs mt-0.5',
                    dailySum >= 50_000 ? 'text-white/80' : 'text-gray-500'
                  )}
                >
                  {totalContextLine(dailySum, false)}
                </p>
              </div>
              <p
                className={clsx(
                  'display-xl leading-none tabular-nums',
                  dailyHasError ? 'text-orange-300' : ''
                )}
              >
                {dailySum.toLocaleString()}
              </p>
            </div>
          </div>

          {saveLoading && <p className="text-xs text-gray-400 text-center mt-2">Saving your steps…</p>}
          {saveError && (
            <p className="text-xs text-orange-600 text-center bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 animate-fade-up mt-2">
              {saveError}
            </p>
          )}
        </div>
      ) : (
        <div className="py-2">
          <p className="font-body text-sm text-gray-500 mb-4 text-center">
            Enter your total steps for the whole week (Mon–Sun).
          </p>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={weeklyTotal}
            onChange={(e) => setWeeklyTotal(e.target.value.replace(/\D/g, ''))}
            className={clsx(
              'w-full border-2 rounded-2xl px-4 py-4 font-display text-navy text-4xl text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-150',
              weeklyHasError
                ? 'border-orange-300 bg-orange-50 text-orange-600 focus:border-orange-400 focus:ring-orange-300/30'
                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-sw-pink focus:ring-sw-pink/25'
            )}
            min="0"
            max={MAX_WEEKLY}
          />
          {weeklyHasError && (
            <p className="text-xs text-orange-600 text-center mt-1">Max {MAX_WEEKLY.toLocaleString()} steps</p>
          )}
          <p className="font-body text-xs text-gray-400 text-center mt-2">steps this week</p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-sw-pink/8 border border-sw-pink/20 rounded-xl px-3 py-2 animate-fade-up">
          <p className="font-body text-sm text-sw-pink text-center">{error}</p>
        </div>
      )}

      {/* Late submission warning before submit */}
      {isLate && totalForSubmit > 0 && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 animate-fade-up">
          <p className="font-body text-sm text-orange-700 text-center">
            ⏰ Late submission — it&rsquo;ll count, but it&rsquo;ll show as late on the leaderboard.
          </p>
        </div>
      )}

      <div className="mt-5">
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={previewMode || totalForSubmit === 0 || hasInputError}
          size="lg"
        >
          {previewMode
            ? 'Opens May 18 — Preview Only'
            : `Lock in ${totalForSubmit > 0 ? totalForSubmit.toLocaleString() + ' steps ' : ''}for Week ${weekNumber}`
          }
        </Button>
      </div>

      {/* The hero moment */}
      <SubmitReveal
        open={revealOpen}
        submittedTotal={submittedAmount}
        weekNumber={weekNumber}
        allSubmissions={[...allSubmissions, ...(pendingSubmission ? [pendingSubmission] : [])]}
        isLate={isLate}
        onDismiss={handleRevealDismiss}
        onSelectWeek={onSelectWeek}
      />
    </Card>
  );
}
