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
  const [savedDailySteps, setSavedDailySteps] = useState<DailyStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load saved daily steps from DB + draft from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/steps?week=${weekNumber}`);
        if (res.ok) {
          const data: DailyStep[] = await res.json();
          setSavedDailySteps(data);
          const fromDB: Record<string, string> = {};
          data.forEach((s) => { fromDB[s.entry_date] = String(s.steps); });
          // Merge with draft (draft takes precedence for unsaved changes)
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

  // Auto-save daily steps to localStorage
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
  if (submission?.is_locked || (submission && status === 'past' && submission)) {
    if (submission.is_locked) {
      return (
        <Card>
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🔒</p>
            <p className="font-display text-navy text-2xl">WEEK {weekNumber} LOCKED</p>
            <p className="font-body text-gray-500 text-sm mt-1">
              This submission has been locked by the admin.
            </p>
            <div className="mt-3 bg-cream rounded-xl p-3">
              <p className="font-display text-sw-pink text-3xl">
                {submission.total_steps.toLocaleString()}
              </p>
              <p className="font-body text-xs text-gray-500">submitted steps</p>
              {submission.is_late && (
                <p className="font-body text-xs text-orange-500 mt-1">⏰ Submitted late</p>
              )}
            </div>
          </div>
        </Card>
      );
    }
  }

  // Already submitted (not locked)
  if (submission && success === false) {
    return (
      <Card>
        <div className="text-center py-2">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-display text-navy text-2xl">WEEK {weekNumber} SUBMITTED</p>
          <div className="mt-3 bg-sw-teal/10 rounded-xl p-3">
            <p className="font-display text-sw-teal text-3xl">
              {submission.total_steps.toLocaleString()}
            </p>
            <p className="font-body text-xs text-gray-500">steps submitted</p>
            {submission.is_late && (
              <p className="font-body text-xs text-orange-500 mt-1">⏰ Submitted late</p>
            )}
          </div>
          <p className="font-body text-xs text-gray-400 mt-3">
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
        <div className="text-center py-4">
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
      <Card>
        <ConfettiEffect trigger={confetti} />
        <div className="text-center py-4">
          <p className="text-4xl mb-2">🎉</p>
          <p className="font-display text-sw-teal text-2xl">STEPS SUBMITTED!</p>
          <p className="font-display text-navy text-4xl mt-1">{totalForSubmit.toLocaleString()}</p>
          <p className="font-body text-sm text-gray-500 mt-1">steps for Week {weekNumber}</p>
          <p className="font-body text-xs text-gray-400 mt-3">
            Your steps are on the leaderboard. Sue is proud. 👟
          </p>
        </div>
      </Card>
    );
  }

  // Entry form
  return (
    <Card>
      <ConfettiEffect trigger={confetti} />

      <p className="font-display text-navy text-xl mb-3">
        WEEK {weekNumber} ENTRY
        <span className="font-body text-sm font-normal text-gray-500 ml-2">
          {formatDate(week.start)} – {formatDate(week.end)}
        </span>
      </p>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        {(['daily', 'weekly'] as EntryMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={clsx(
              'flex-1 py-2 rounded-lg font-body text-sm font-medium transition-all',
              mode === m ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            )}
          >
            {m === 'daily' ? '📅 Daily steps' : '📊 Weekly total'}
          </button>
        ))}
      </div>

      {mode === 'daily' ? (
        <div className="space-y-2">
          {days.map((date) => {
            const dayName = getDayName(date);
            const dateStr = formatDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <div key={date} className={clsx('flex items-center gap-3 py-2 px-3 rounded-xl', isToday && 'bg-sw-teal/10')}>
                <div className="w-16 shrink-0">
                  <p className="font-body text-sm font-semibold text-navy">{dayName}</p>
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
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 font-body text-navy text-right text-lg focus:outline-none focus:border-sw-teal"
                  min="0"
                />
                <span className="font-body text-xs text-gray-400 shrink-0">steps</span>
              </div>
            );
          })}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 px-3">
            <p className="font-body font-semibold text-navy">Weekly Total</p>
            <p className="font-display text-sw-pink text-3xl">{dailySum.toLocaleString()}</p>
          </div>
          {saveLoading && <p className="text-xs text-gray-400 text-center">Saving...</p>}
        </div>
      ) : (
        <div className="py-2">
          <p className="font-body text-sm text-gray-600 mb-3">
            Enter your total steps for the whole week (Mon–Sun).
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={weeklyTotal}
              onChange={(e) => setWeeklyTotal(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-display text-navy text-3xl text-center focus:outline-none focus:border-sw-pink"
              min="0"
            />
          </div>
          <p className="font-body text-xs text-gray-400 text-center mt-2">steps this week</p>
        </div>
      )}

      {error && (
        <p className="font-body text-sm text-sw-pink mt-3 text-center">{error}</p>
      )}

      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={totalForSubmit === 0}
          size="lg"
        >
          Submit {totalForSubmit > 0 ? totalForSubmit.toLocaleString() : ''} Steps for Week {weekNumber} 👟
        </Button>
      </div>
    </Card>
  );
}
