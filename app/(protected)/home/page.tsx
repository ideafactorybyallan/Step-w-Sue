import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getParticipantTitle } from '@/lib/sue-says';
import { SueSaysCard } from '@/components/SueSaysCard';
import { MondayBanner } from '@/components/MondayBanner';
import { CountdownCard } from '@/components/CountdownCard';
import { PrizePoolCard } from '@/components/PrizePoolCard';
import { RulesCard } from '@/components/RulesCard';
import { Card } from '@/components/ui/Card';
import {
  isMondayEDT,
  isChallengeStarted,
  getCurrentWeekNumber,
  getWeekStatus,
  WEEKS,
  formatDate,
} from '@/lib/dates';

async function getHomeData() {
  const [pRes, sRes, aRes] = await Promise.all([
    supabase.from('participants').select('*').eq('is_active', true),
    supabase.from('weekly_submissions').select('*'),
    supabase
      .from('announcements')
      .select('id, message')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const participants = pRes.data ?? [];
  const submissions = sRes.data ?? [];
  const announcements = aRes.data ?? [];

  const total = participants.length;

  // Overall leader
  const totals = new Map<string, { steps: number; first_at: string | null }>();
  participants.forEach((p) => totals.set(p.id, { steps: 0, first_at: null }));
  submissions.forEach((s) => {
    const e = totals.get(s.participant_id);
    if (e) {
      e.steps += s.total_steps;
      if (!e.first_at || s.submitted_at < e.first_at) e.first_at = s.submitted_at;
    }
  });

  const sorted = participants
    .map((p) => ({ participant: p, ...totals.get(p.id)! }))
    .sort((a, b) => {
      if (b.steps !== a.steps) return b.steps - a.steps;
      if (a.first_at && b.first_at) return a.first_at < b.first_at ? -1 : 1;
      if (a.first_at) return -1;
      return 1;
    });

  const overallLeader = sorted[0] ?? null;

  // Current week leader
  const currentWeek = getCurrentWeekNumber();
  let weekLeader: (typeof participants)[0] | null = null;
  let weekLeaderSteps = 0;

  if (currentWeek) {
    const weekSubs = submissions.filter((s) => s.week_number === currentWeek);
    const weekSorted = participants
      .map((p) => ({
        participant: p,
        steps: weekSubs.find((s) => s.participant_id === p.id)?.total_steps ?? 0,
        submitted_at: weekSubs.find((s) => s.participant_id === p.id)?.submitted_at ?? null,
      }))
      .sort((a, b) => {
        if (b.steps !== a.steps) return b.steps - a.steps;
        if (a.submitted_at && b.submitted_at) return a.submitted_at < b.submitted_at ? -1 : 1;
        if (a.submitted_at) return -1;
        return 1;
      });
    if (weekSorted[0]?.steps > 0) {
      weekLeader = weekSorted[0].participant;
      weekLeaderSteps = weekSorted[0].steps;
    }
  }

  return { participants, total, overallLeader, weekLeader, weekLeaderSteps, currentWeek, announcements };
}

export default async function HomePage() {
  const session = await getSession();
  const { participants, total, overallLeader, weekLeader, weekLeaderSteps, currentWeek, announcements } = await getHomeData();
  const isMonday = isMondayEDT();
  const challengeStarted = isChallengeStarted();

  const leaderTitle = overallLeader
    ? getParticipantTitle(1, total, true, false)
    : null;

  const overallLeaderName = overallLeader
    ? overallLeader.participant.nickname ?? `${overallLeader.participant.first_name} ${overallLeader.participant.last_name}`
    : null;

  const weekLeaderName = weekLeader
    ? weekLeader.nickname ?? `${weekLeader.first_name} ${weekLeader.last_name}`
    : null;

  const currentWeekInfo = currentWeek ? WEEKS[currentWeek - 1] : null;

  return (
    <div className="flex flex-col">
      {/* Monday reminder banner */}
      {isMonday && challengeStarted && <MondayBanner />}

      {/* Hero header */}
      <div className="bg-navy px-6 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-6xl opacity-10 select-none">🍁</div>
        <p className="font-body text-sw-teal text-xs font-bold tracking-widest uppercase mb-1">
          Sue's 3rd Official Annual
        </p>
        <p className="font-display text-white text-4xl leading-none">VICTORIA DAY</p>
        <p className="font-display text-sw-pink text-5xl leading-none">STEP</p>
        <p className="font-display text-white text-3xl leading-none mb-3">CHALLENGE 2026</p>

        {session && (
          <p className="font-body text-white/60 text-sm">
            Welcome back,{' '}
            <span className="text-white font-semibold">
              {session.nickname ?? session.first_name}
            </span>{' '}
            👋
          </p>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="bg-gold/15 border border-gold/40 rounded-xl p-3 text-center">
              <p className="font-body text-navy text-sm font-medium">📢 {a.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Countdown */}
        <CountdownCard />

        {/* Live highlights */}
        {challengeStarted && (
          <div className="grid grid-cols-2 gap-3">
            {/* Overall leader */}
            <Card>
              <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">Overall Leader</p>
              {overallLeader && overallLeaderName ? (
                <>
                  <p className="font-display text-navy text-xl leading-tight">{overallLeaderName.toUpperCase()}</p>
                  <p className="font-display text-sw-pink text-xl leading-tight">
                    {overallLeader.steps.toLocaleString()}
                  </p>
                  <p className="font-body text-xs text-gray-400">total steps</p>
                </>
              ) : (
                <p className="font-body text-sm text-gray-400">No submissions yet!</p>
              )}
            </Card>

            {/* Week leader */}
            <Card>
              <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                {currentWeek ? `Week ${currentWeek} Leader` : 'Week Leader'}
              </p>
              {weekLeader && weekLeaderName ? (
                <>
                  <p className="font-display text-navy text-xl leading-tight">{weekLeaderName.toUpperCase()}</p>
                  <p className="font-display text-sw-teal text-xl leading-tight">
                    {weekLeaderSteps.toLocaleString()}
                  </p>
                  <p className="font-body text-xs text-gray-400">this week</p>
                </>
              ) : (
                <p className="font-body text-sm text-gray-400">
                  {currentWeek ? 'No submissions yet!' : 'Challenge complete'}
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Participants + week info */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-display text-navy text-2xl leading-tight">
                  {total} CHALLENGER{total !== 1 ? 'S' : ''}
                </p>
                <p className="font-body text-xs text-gray-400">in the 2026 challenge</p>
              </div>
            </div>
            {currentWeekInfo && (
              <div className="text-right">
                <p className="font-body text-xs font-semibold text-sw-teal">
                  Week {currentWeek} Active
                </p>
                <p className="font-body text-xs text-gray-400">
                  Until {formatDate(currentWeekInfo.end)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick action */}
        <Link href="/steps">
          <div className="bg-sw-pink rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-transform">
            <div>
              <p className="font-display text-white text-2xl leading-tight">ADD MY STEPS</p>
              <p className="font-body text-white/80 text-sm">
                {isMonday ? 'Submit today! Deadline is midnight.' : 'Track your progress'}
              </p>
            </div>
            <span className="text-4xl">👟</span>
          </div>
        </Link>

        {/* Prize pool */}
        <PrizePoolCard participantCount={total} />

        {/* Sue Says */}
        <SueSaysCard />

        {/* Rules */}
        <RulesCard />
      </div>
    </div>
  );
}
