'use client';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { StepEntryWeek } from '@/components/StepEntryWeek';
import { MondayBanner } from '@/components/MondayBanner';
import { SueSaysCard } from '@/components/SueSaysCard';
import { isMondayEDT, isChallengeStarted, getWeekStatus } from '@/lib/dates';
import type { WeeklySubmission, SessionUser } from '@/lib/types';

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

  // Default to the current active week
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
      <div className="bg-navy px-6 pt-10 pb-6">
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

        {/* Challenge not started */}
        {!started && (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-display text-navy text-2xl">CHALLENGE STARTS</p>
            <p className="font-display text-sw-pink text-2xl">MAY 18!</p>
            <p className="font-body text-sm text-gray-500 mt-2">
              Come back on May 18 to start logging your steps!
            </p>
          </div>
        )}

        {/* Week selector */}
        {started && (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[1, 2, 3, 4].map((w) => {
                const status = getWeekStatus(w);
                const sub = getSubmissionForWeek(w);
                const isActive = selectedWeek === w;
                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={clsx(
                      'shrink-0 px-4 py-2 rounded-full font-body font-semibold text-sm transition-all flex items-center gap-1.5',
                      isActive ? 'bg-navy text-white shadow' : 'bg-white text-navy border border-gray-200'
                    )}
                  >
                    {sub ? '✅' : status === 'active' ? '🟢' : status === 'upcoming' ? '📅' : '⏰'}
                    {' '}Week {w}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 font-body text-sm">
                Loading your steps...
              </div>
            ) : me ? (
              <StepEntryWeek
                weekNumber={selectedWeek}
                submission={getSubmissionForWeek(selectedWeek)}
                userId={me.id}
              />
            ) : null}

            <SueSaysCard />
          </>
        )}
      </div>
    </div>
  );
}
