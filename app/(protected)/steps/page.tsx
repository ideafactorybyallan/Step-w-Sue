'use client';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { StepEntryWeek } from '@/components/StepEntryWeek';
import { MondayBanner } from '@/components/MondayBanner';
import { SueSaysCard } from '@/components/SueSaysCard';
import { isMondayEDT, isChallengeStarted, getWeekStatus, formatDate, WEEKS } from '@/lib/dates';
import type { WeeklySubmission, SessionUser } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  active:   '🟢 Active',
  upcoming: '📅 Soon',
  past:     '⏰ Past',
};

export default function StepsPage() {
  const [me, setMe] = useState<SessionUser | null>(null);
  const [submissions, setSubmissions] = useState<WeeklySubmission[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const isMonday = isMondayEDT();
  const started = isChallengeStarted();

  useEffect(() => {
    const load = async () => {
      const [meRes, subRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/submissions'),
      ]);
      if (meRes.ok) setMe(await meRes.json());
      if (subRes.ok) setSubmissions(await subRes.json());
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    for (let w = 1; w <= 4; w++) {
      if (getWeekStatus(w) === 'active') { setSelectedWeek(w); break; }
    }
  }, []);

  const getSubmissionForWeek = (w: number) =>
    submissions.find((s) => s.week_number === w) ?? null;

  return (
    <div className="flex flex-col">
      {isMonday && started && <MondayBanner />}

      {/* Header */}
      <div className="bg-navy px-6 pt-10 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-sw-teal/10 rounded-full blur-3xl pointer-events-none" />
        <p className="font-body text-sw-teal text-xs font-bold tracking-widest uppercase mb-1">
          My Progress
        </p>
        <p className="font-display text-sw-pink text-5xl leading-none">MY</p>
        <p className="font-display text-white text-4xl leading-none mb-2">STEPS</p>
        {me && (
          <p className="font-body text-white/60 text-sm">
            Logged in as <span className="text-white font-semibold">{me.nickname ?? me.first_name}</span>
          </p>
        )}
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Week selector — card style */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((w) => {
            const status = getWeekStatus(w);
            const sub = getSubmissionForWeek(w);
            const isActive = selectedWeek === w;
            const chipEmoji = sub?.is_locked ? '🔒' : sub ? '✅' : status === 'active' ? '🟢' : status === 'upcoming' ? '📅' : '⏰';
            const chipLabel = sub?.is_locked ? 'Locked' : sub ? 'Done' : status === 'active' ? 'Active' : status === 'upcoming' ? 'Soon' : 'Overdue';
            return (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={clsx(
                  'rounded-2xl p-4 text-center transition-all duration-150 border-2',
                  isActive
                    ? 'bg-navy border-navy shadow-btn'
                    : 'bg-white border-transparent shadow-card hover:shadow-card-hover'
                )}
              >
                <p className={clsx('font-display text-lg leading-tight', isActive ? 'text-white' : 'text-navy')}>
                  W{w}
                </p>
                <p className="text-xl mt-0.5">{chipEmoji}</p>
                <p className={clsx('font-body text-xs mt-0.5', isActive ? 'text-white/70' : 'text-gray-400')}>
                  {chipLabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected week date range */}
        <p className="font-body text-xs text-gray-400 text-center mt-1">
          Week {selectedWeek}: {formatDate(WEEKS[selectedWeek - 1].start)} – {formatDate(WEEKS[selectedWeek - 1].end)}
        </p>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <div className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-3" />
            <p className="font-body text-sm text-gray-400">Loading your steps...</p>
          </div>
        ) : me ? (
          <StepEntryWeek
            weekNumber={selectedWeek}
            submission={getSubmissionForWeek(selectedWeek)}
            userId={me.id}
            previewMode={!started}
          />
        ) : null}

        <SueSaysCard />
      </div>
    </div>
  );
}
