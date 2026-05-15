'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ConfettiEffect } from './ConfettiEffect';
import { getDaysInWeek, getDayName, formatDate, getWeekStatus } from '@/lib/dates';
import { WEEKS } from '@/lib/dates';
import { clsx } from 'clsx';
import type { WeeklySubmission, DailyStep } from '@/lib/types';

interface Props {
  weekNumber: number;
  submission: WeeklySubmission | null;
  userId: string;
}

type EntryMode = 'daily' | 'weekly';

export function StepEntryWeek({ weekNumber, submission, userId }: Props) {
  const week = WEEKS[weekNumber - 1];
  const days = getDaysInWeek(weekNumber);
  const status = getWeekStatus(weekNumber);

  const DRAFT_KEY = `swc_draft_week_${weekNumber}_${userId}`;

  const [mode, setMode] = useState<EntryMode>('daily');
  const [dailySteps, setDailySteps] = useState<Record<string, string>>({});
  const [weeklyTotal, setWeeklyTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/steps?week=${weekNumber}`);
        if (res.ok) {
          const data: DailyStep[] = await res.json();
          const fromDB: Record<string, string> = {};
          data.forEach((s) => { fromDB[s.entry_date] = String(s.steps); });
          const draft = localStorage.getItem(DRAFT_KEY);
          const merged = draft ? { ...fromDB, ...JSON.parse(draft) } : fromDB;
          setDailySteps(merged);
        }
      } catch {/* non-critical */}
    };
    loadData();
  }, [weekNumber, DRAFT_KEY]);

  const dailySum = days.reduce((sum, d) => sum + (parseInt(dailySteps[d] || '0') || 0), 0);
  const totalForSubmit = mode === 'daily' ? dailySum : parseInt(weeklyTotal || '0') || 0;

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
    const steps = parseInt(dailySteps[date] || '0');
    if (isNaN(steps)) return;
    setSaveLoading(true);
    try {
      await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_date: date, steps }),
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (totalForSubmit === 0) {
      setError('Please enter your steps before submitting.');
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
      setConfetti(true);
      setSuccess(true);
      setTimeout(() => setConfetti(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Locked state
  if (submission?.is_locked) {
    return (
      <Card>
        <div className="text-center py-3">
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} LOCKED</p>
          <p className="font-body text-gray-500 text-sm mt-1">
            This submission has been locked by the admin.
          </p>
          <div className="mt-4 bg-navy/5 border border-navy/10 rounded-2xl p-4">
            <p className="font-display text-sw-pink text-4xl">{submission.total_steps.toLocaleString()}</p>
            <p className="font-body text-xs text-gray-500 mt-1">submitted steps</p>
            {submission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1">⏰ Submitted late</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Already submitted (not locked)
  if (submission && !success) {
    return (
      <Card>
        <div className="text-center py-3">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} SUBMITTED</p>
          <div className="mt-4 bg-sw-teal/10 border border-sw-teal/20 rounded-2xl p-4">
            <p className="font-display text-sw-teal text-4xl">{submission.total_steps.toLocaleString()}</p>
            <p className="font-body text-xs text-gray-500 mt-1">steps submitted</p>
            {submission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1">⏰ Submitted late</p>
            )}
          </div>
          <p className="font-body text-xs text-gray-400 mt-4">
            Need to change it? Ask the admin to unlock this week.
          </p>
        </div>
      </Card>
    );
  }

  // Upcoming week
  if (status === 'upcoming') {
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
            You're on the leaderboard. Sue is proud. 👟
          </p>
        </div>
      </Card>
    );
  }

  // Entry form
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <ConfettiEffect trigger={confetti} />

      <div className="flex items-baseline gap-2 mb-4">
        <p className="font-display text-navy text-xl">WEEK {weekNumber}</p>
        <p className="font-body text-sm text-gray-400">
          {formatDate(week.start)} – {formatDate(week.end)}
        </p>
      </div>

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
            onClick={() => setMode(m)}
            className={clsx(
              'relative z-10 flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-200',
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
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={dailySteps[date] ?? ''}
                  onChange={(e) => handleDayChange(date, e.target.value)}
                  onBlur={() => handleSaveDayToDb(date)}
                  className={clsx(
                    'flex-1 border rounded-xl px-3 py-2 font-body text-navy text-right text-lg focus:outline-none transition-colors',
                    isToday
                      ? 'border-sw-teal/30 bg-white focus:border-sw-teal'
                      : 'border-gray-200 bg-white focus:border-sw-teal'
                  )}
                  min="0"
                />
              </div>
            );
          })}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 px-1">
            <p className="font-body font-semibold text-navy text-sm">Weekly Total</p>
            <p className="font-display text-sw-pink text-3xl">{dailySum.toLocaleString()}</p>
          </div>
          {saveLoading && <p className="text-xs text-gray-400 text-center">Saving...</p>}
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
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 font-display text-navy text-4xl text-center focus:outline-none focus:border-sw-pink transition-colors"
            min="0"
          />
          <p className="font-body text-xs text-gray-400 text-center mt-2">steps this week</p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-sw-pink/8 border border-sw-pink/20 rounded-xl px-3 py-2 animate-fade-up">
          <p className="font-body text-sm text-sw-pink text-center">{error}</p>
        </div>
      )}

      <div className="mt-5">
        <Button onClick={handleSubmit} loading={loading} disabled={totalForSubmit === 0} size="lg">
          Submit {totalForSubmit > 0 ? totalForSubmit.toLocaleString() : ''} Steps for Week {weekNumber} 👟
        </Button>
      </div>
    </Card>
  );
}
