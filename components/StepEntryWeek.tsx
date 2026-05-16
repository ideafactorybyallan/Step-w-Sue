'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ConfettiEffect } from './ConfettiEffect';
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
}

type EntryMode = 'daily' | 'weekly';

const MAX_DAILY = 100_000;
const MAX_WEEKLY = 200_000;

export function StepEntryWeek({ weekNumber, submission, userId, previewMode = false }: Props) {
  const week = WEEKS[weekNumber - 1];
  const days = getDaysInWeek(weekNumber);
  const status = getWeekStatus(weekNumber);
  const isLate = isLateSubmission(weekNumber);

  const DRAFT_KEY = `swc_draft_week_${weekNumber}_${userId}`;

  const [mode, setMode] = useState<EntryMode>('daily');
  const [dailySteps, setDailySteps] = useState<Record<string, string>>({});
  const [weeklyTotal, setWeeklyTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [success, setSuccess] = useState(false);
  const weekCache = useRef<Map<number, DailyStep[]>>(new Map());

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
      if (!res.ok) setSaveError('❌ Couldn’t save — tap to try again');
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
      setConfetti(true);
      setSuccess(true);
      setTimeout(() => setConfetti(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Locked state
  if (!previewMode && submission?.is_locked) {
    return (
      <Card>
        <div className="text-center py-3">
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} LOCKED</p>
          <p className="font-body text-gray-500 text-sm mt-1">
            This submission has been locked by the admin.
          </p>
          <div className="mt-4 bg-navy/5 border border-navy/10 rounded-2xl p-4">
            <p className="font-display text-sw-pink text-5xl">{submission.total_steps.toLocaleString()}</p>
            <p className="font-body text-xs text-gray-500 mt-1">submitted steps</p>
            {submission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1.5">⏰ Submitted late</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Already submitted (not locked)
  if (!previewMode && submission && !success) {
    return (
      <Card>
        <div className="text-center py-3">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} SUBMITTED</p>
          <div className="mt-4 bg-sw-teal/10 border border-sw-teal/20 rounded-2xl p-4">
            <p className="font-display text-sw-teal text-5xl">{submission.total_steps.toLocaleString()}</p>
            <p className="font-body text-xs text-gray-500 mt-1">steps submitted</p>
            {submission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1.5">⏰ Submitted late</p>
            )}
            <p className="font-body text-xs text-gray-400 mt-2">
              Submitted {formatDateShort(submission.submitted_at.split('T')[0])}
            </p>
          </div>
          <p className="font-body text-xs text-gray-400 mt-4">
            Need to change it? Ask the admin to unlock this week.
          </p>
        </div>
      </Card>
    );
  }

  // Upcoming week
  if (!previewMode && status === 'upcoming') {
    return (
      <Card>
        <div className="text-center py-5">
          <p className="text-3xl mb-2">📅</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} UPCOMING</p>
          <p className="font-body text-sm text-gray-500 mt-1">
            Starts {formatDate(week.start)} — get those sneakers ready!
          </p>
        </div>
      </Card>
    );
  }

  // Success state
  if (success) {
    return (
      <Card className="overflow-hidden">
        <ConfettiEffect trigger={confetti} />
        <div className="bg-gradient-to-br from-sw-teal/15 to-sw-teal/5 border border-sw-teal/20 rounded-xl p-6 text-center animate-fade-up">
          <p className="text-5xl mb-3">🎉</p>
          <p className="font-display text-sw-teal text-2xl">STEPS SUBMITTED!</p>
          <p className="font-display text-navy text-5xl mt-1">{totalForSubmit.toLocaleString()}</p>
          <p className="font-body text-sm text-gray-500 mt-1">steps for Week {weekNumber}</p>
          <p className="font-body text-xs text-gray-400 mt-4">
            You’re on the leaderboard. Sue is proud. 👟
          </p>
        </div>
      </Card>
    );
  }

  // Entry form
  const today = new Date().toISOString().split('T')[0];

  // Days until deadline
  const deadlineDisplay = formatDate(week.deadline);
  const daysUntilDeadline = Math.ceil(
    (new Date(week.deadline).getTime() - Date.now()) / 86400000
  );
  const deadlineIsUrgent = daysUntilDeadline <= 2 && !isLate;

  return (
    <Card>
      <ConfettiEffect trigger={confetti} />

      <div className="flex items-baseline gap-2 mb-1">
        <p className="font-display text-navy text-xl">WEEK {weekNumber}</p>
        <p className="font-body text-sm text-gray-400">
          {formatDate(week.start)} – {formatDate(week.end)}
        </p>
      </div>

      {/* Deadline / preview banner */}
      {previewMode ? (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-body font-medium bg-navy/5 border border-navy/10 text-navy/50">
          <span>🔒</span>
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
          className="absolute inset-1 rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out"
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
            {m === 'daily' ? '📅 Daily' : '📊 Weekly total'}
          </button>
        ))}
      </div>

      {mode === 'daily' ? (
        <div className="space-y-1.5">
          {days.map((date) => {
            const dayName = getDayName(date);
            const dateStr = formatDate(date);
            const isToday = date === today;
            const dayVal = parseInt(dailySteps[date] || '0');
            const dayError = dayVal > MAX_DAILY;
            return (
              <div
                key={date}
                className={clsx(
                  'flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors',
                  isToday
                    ? 'bg-sw-teal/15 border border-sw-teal/25'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="w-14 shrink-0">
                  <p className={clsx('font-body text-sm font-semibold', isToday ? 'text-sw-teal-dark' : 'text-navy')}>
                    {dayName}
                  </p>
                  <p className="font-body text-xs text-gray-400">{dateStr}</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={dailySteps[date] ?? ''}
                    onChange={(e) => handleDayChange(date, e.target.value)}
                    onBlur={() => handleSaveDayToDb(date)}
                    className={clsx(
                      'w-full border rounded-xl px-3 py-2 font-body text-navy text-right text-lg focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-150',
                      dayError
                        ? 'border-orange-300 bg-orange-50 hover:border-orange-400 focus:border-orange-400 focus:ring-orange-300/30'
                        : isToday
                        ? 'border-sw-teal/30 bg-white hover:border-sw-teal/50 focus:border-sw-teal focus:ring-sw-teal/25'
                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-sw-teal focus:ring-sw-teal/25'
                    )}
                    min="0"
                    max={MAX_DAILY}
                  />
                  {dayError && (
                    <p className="text-xs text-orange-600 mt-0.5 text-right">Max {MAX_DAILY.toLocaleString()}/day — easy there!</p>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 px-1">
            <p className="font-body font-semibold text-navy text-sm">Weekly Total</p>
            <p className={clsx('font-display text-3xl', dailyHasError ? 'text-orange-400' : 'text-sw-pink')}>
              {dailySum.toLocaleString()}
            </p>
          </div>
          {saveLoading && <p className="text-xs text-gray-400 text-center">Saving your steps…</p>}
          {saveError && (
            <p className="text-xs text-orange-600 text-center bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 animate-fade-up">
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
              'w-full border-2 rounded-2xl px-4 py-4 font-display text-navy text-4xl text-center focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-150',
              weeklyHasError
                ? 'border-orange-300 bg-orange-50 hover:border-orange-400 focus:border-orange-400 focus:ring-orange-300/30'
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
            ⏰ This submission is late — it will be marked as late on the leaderboard.
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
            ? 'Opens May 18 — Preview Only 🔒'
            : `Submit ${totalForSubmit > 0 ? totalForSubmit.toLocaleString() : ''} Steps for Week ${weekNumber} 👟`
          }
        </Button>
      </div>
    </Card>
  );
}
