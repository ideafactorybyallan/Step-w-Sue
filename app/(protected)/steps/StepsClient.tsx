'use client';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StepEntryWeek } from '@/components/StepEntryWeek';
import { MondayBanner } from '@/components/MondayBanner';
import { SueSaysCard } from '@/components/SueSaysCard';
import { SueMark, LockMark } from '@/components/marks';
import { isMondayEDT, isChallengeStarted, getWeekStatus, getCurrentWeekNumber, formatDate, WEEKS } from '@/lib/dates';
import type { WeeklySubmission, SessionUser } from '@/lib/types';

interface Props {
  session: SessionUser;
  submissions: WeeklySubmission[];
}

function headerSubline({
  started,
  selectedWeek,
  submission,
  isFinal,
}: {
  started: boolean;
  selectedWeek: number;
  submission: WeeklySubmission | null;
  isFinal: boolean;
}): string {
  if (!started) return 'Tying shoes…';
  if (submission?.is_locked) return `Week ${selectedWeek} locked in.`;
  if (submission) return `Week ${selectedWeek} submitted.`;
  if (isFinal) return 'Last lap. Make it count.';
  return `Week ${selectedWeek} — submit by Monday midnight.`;
}

export function StepsClient({ session, submissions }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const isMonday = isMondayEDT();
  const started = isChallengeStarted();
  const currentWeekNum = getCurrentWeekNumber();
  const currentWeekSubmitted = currentWeekNum
    ? submissions.some((s) => s.week_number === currentWeekNum)
    : false;

  useEffect(() => {
    for (let w = 1; w <= 4; w++) {
      if (getWeekStatus(w) === 'active') { setSelectedWeek(w); break; }
    }
  }, []);

  const getSubmissionForWeek = (w: number) =>
    submissions.find((s) => s.week_number === w) ?? null;

  const showMondayBanner =
    isMonday && started && (currentWeekNum ?? 0) > 1 && !currentWeekSubmitted;

  const selectedSubmission = getSubmissionForWeek(selectedWeek);

  return (
    <div className="flex flex-col">
      {showMondayBanner && <MondayBanner />}

      {/* Header */}
      <div className="bg-hero-navy-tight px-6 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))] pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-sw-teal/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <p className="font-body text-sw-teal text-[10px] font-bold tracking-[0.3em] uppercase mb-1">
          My Progress
        </p>
        <p className="display-hero text-white">MY STEPS</p>
        <p className="font-body text-white/65 text-sm mt-2 italic">
          {headerSubline({
            started,
            selectedWeek,
            submission: selectedSubmission,
            isFinal: selectedWeek === 4 && started,
          })}
        </p>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Observer mode */}
        {session.is_observer ? (
          <>
            <div className="bg-white rounded-2xl p-8 text-center shadow-el-3 border border-sw-teal/20 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-sw-teal/10 rounded-full blur-3xl pointer-events-none" />
              <SueMark className="w-16 h-16 mx-auto mb-3 relative" />
              <p className="display-md text-navy relative">YOU&rsquo;RE ON OBSERVER DUTY</p>
              <p className="font-body text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed relative">
                No steps to log, but you&rsquo;ve got the best seat. Sue&rsquo;s keeping score.
              </p>
              <p className="font-body text-xs text-gray-400 mt-2 italic max-w-xs mx-auto relative">
                Your role: watch closely. Maybe cheer. Definitely judge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-5 relative">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1 bg-sw-pink text-white font-body font-semibold text-sm rounded-full px-4 py-2 shadow-el-2 active:scale-[0.94] transition-transform duration-150 ease-spring"
                >
                  See the standings <ChevronRight size={14} />
                </Link>
                <Link
                  href="/home"
                  className="inline-flex items-center gap-1 border border-navy/20 text-navy/80 font-body font-semibold text-sm rounded-full px-4 py-2 active:scale-[0.94] transition-transform duration-150 ease-spring"
                >
                  Who&rsquo;s leading?
                </Link>
              </div>
            </div>
            <SueSaysCard />
          </>
        ) : (
          <>
            {/* Week selector — storytelling chips */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((w) => {
                const status = getWeekStatus(w);
                const sub = getSubmissionForWeek(w);
                const isSelected = selectedWeek === w;

                const isLocked = !!sub?.is_locked;
                const isDone = !!sub && !isLocked;
                const isActive = status === 'active' && !sub;
                const isUpcoming = status === 'upcoming';
                const isOverdue = status === 'past' && !sub;

                const ringClass = isSelected ? 'ring-2 ring-navy ring-offset-2 ring-offset-cream' : '';

                let stateClasses: string;
                let label: string;
                let labelClass: string;
                let weekColor: string;
                let icon: React.ReactNode = null;

                if (isLocked) {
                  stateClasses = 'bg-gold/15 border border-gold/40';
                  label = 'LOCKED';
                  labelClass = 'text-gold-dark';
                  weekColor = 'text-gold-dark';
                  icon = <LockMark className="w-3 h-3 text-gold-dark" />;
                } else if (isDone) {
                  stateClasses = 'bg-sw-teal/12 border border-sw-teal/35';
                  label = 'DONE';
                  labelClass = 'text-sw-teal-dark';
                  weekColor = 'text-sw-teal-dark';
                } else if (isActive) {
                  stateClasses = 'bg-navy border border-navy shadow-el-3 animate-glow-pulse';
                  label = 'ACTIVE';
                  labelClass = 'text-white';
                  weekColor = 'text-white';
                } else if (isUpcoming) {
                  stateClasses = 'bg-cream border-2 border-dashed border-navy/25';
                  label = 'SOON';
                  labelClass = 'text-navy/55';
                  weekColor = 'text-navy/65';
                } else if (isOverdue) {
                  stateClasses = 'bg-gray-100 border border-gray-200 opacity-70';
                  label = 'PAST';
                  labelClass = 'text-gray-400 line-through';
                  weekColor = 'text-gray-500';
                } else {
                  stateClasses = 'bg-white border border-transparent shadow-el-1 hover:shadow-el-2';
                  label = '';
                  labelClass = 'text-gray-400';
                  weekColor = 'text-navy';
                }

                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={clsx(
                      'rounded-2xl p-3 text-center transition-all duration-150 active:scale-[0.94] flex flex-col items-center justify-center gap-0.5 min-h-[78px]',
                      stateClasses,
                      ringClass
                    )}
                  >
                    <p className={clsx('display-md leading-none', weekColor)}>W{w}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {icon}
                      <p className={clsx('font-body text-[10px] font-semibold tracking-wider', labelClass)}>
                        {label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected week date range */}
            <p className="font-body text-xs text-gray-400 text-center">
              Week {selectedWeek}: {formatDate(WEEKS[selectedWeek - 1].start)} – {formatDate(WEEKS[selectedWeek - 1].end)}
            </p>

            <StepEntryWeek
              weekNumber={selectedWeek}
              submission={selectedSubmission}
              userId={session.id}
              previewMode={!started}
              allSubmissions={submissions}
              onSelectWeek={setSelectedWeek}
            />

            <SueSaysCard />
          </>
        )}
      </div>
    </div>
  );
}
