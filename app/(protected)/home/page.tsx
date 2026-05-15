import Link from 'next/link';
import { ArrowRight, TrendingUp, Award } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { SueSaysCard } from '@/components/SueSaysCard';
import { MondayBanner } from '@/components/MondayBanner';
import { CountdownCard } from '@/components/CountdownCard';
import { PrizePoolCard } from '@/components/PrizePoolCard';
import { RulesCard } from '@/components/RulesCard';
import {
  isMondayEDT,
  isChallengeStarted,
  getCurrentWeekNumber,
  WEEKS,
  formatDate,
} from '@/lib/dates';

async function getHomeData(currentUserId: string | null) {
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

  const totals = new Map<string, { steps: number; first_at: string | null; count: number }>();
  participants.forEach((p) => totals.set(p.id, { steps: 0, first_at: null, count: 0 }));
  submissions.forEach((s) => {
    const e = totals.get(s.participant_id);
    if (e) {
      e.steps += s.total_steps;
      e.count += 1;
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

  // Current user's stats
  const userIndex = currentUserId ? sorted.findIndex((s) => s.participant.id === currentUserId) : -1;
  const userStats = userIndex >= 0 ? {
    rank: userIndex + 1,
    steps: sorted[userIndex].steps,
    weeksSubmitted: sorted[userIndex].count,
    leaderSteps: sorted[0]?.steps ?? 0,
  } : null;

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

  return { total, overallLeader, weekLeader, weekLeaderSteps, currentWeek, announcements, userStats };
}

const AVATAR_COLORS = ['#E8234A', '#2BB8AA', '#1B2F5E', '#F5C518', '#8B5CF6'];

function avatarBg(name: string): string {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function avatarFg(bg: string): string {
  return bg === '#F5C518' ? '#1B2F5E' : '#ffffff';
}

export default async function HomePage() {
  const session = await getSession();
  const { total, overallLeader, weekLeader, weekLeaderSteps, currentWeek, announcements, userStats } = await getHomeData(session?.id ?? null);
  const isMonday = isMondayEDT();
  const challengeStarted = isChallengeStarted();

  const overallLeaderName = overallLeader
    ? overallLeader.participant.nickname ?? `${overallLeader.participant.first_name} ${overallLeader.participant.last_name}`
    : null;

  const weekLeaderName = weekLeader
    ? weekLeader.nickname ?? `${weekLeader.first_name} ${weekLeader.last_name}`
    : null;

  const currentWeekInfo = currentWeek ? WEEKS[currentWeek - 1] : null;
  const userDisplayName = session?.nickname ?? session?.first_name ?? '';
  const userAvatarBg = session ? avatarBg(session.first_name) : '#E8234A';
  const userAvatarFg = avatarFg(userAvatarBg);

  // Progress to leader percentage
  const progressPct = userStats && userStats.leaderSteps > 0
    ? Math.min(100, Math.round((userStats.steps / userStats.leaderSteps) * 100))
    : 0;

  return (
    <div className="flex flex-col">
      {isMonday && challengeStarted && <MondayBanner />}

      {/* Hero header — premium gradient */}
      <div className="bg-hero-navy px-6 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-7xl opacity-[0.08] select-none animate-float-slow">🍁</div>
        <div className="absolute bottom-2 left-2 text-6xl opacity-[0.06] select-none">👟</div>

        <p className="font-body text-sw-teal text-xs font-bold tracking-[0.25em] uppercase mb-1">
          Sue's 3rd Official Annual
        </p>
        <p className="font-display text-white text-4xl leading-none">VICTORIA DAY</p>
        <p className="font-display text-sw-pink text-6xl leading-none drop-shadow-lg">STEP</p>
        <p className="font-display text-white text-3xl leading-none mb-4">CHALLENGE 2026</p>

        {session && (
          <div className="flex items-center gap-2.5 mt-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-sm shrink-0 border-2 border-white/20"
              style={{ backgroundColor: userAvatarBg, color: userAvatarFg }}
            >
              {session.first_name.charAt(0).toUpperCase()}
            </div>
            <p className="font-body text-white/70 text-sm">
              Welcome back, <span className="text-white font-semibold">{userDisplayName}</span> 👋
            </p>
          </div>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="bg-gold/15 border border-gold/40 rounded-xl p-4 flex items-start gap-2 animate-fade-up">
              <span className="text-base shrink-0">📢</span>
              <p className="font-body text-navy text-sm font-medium">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 pb-6 space-y-4 stagger-children">
        {/* Countdown */}
        <CountdownCard />

        {/* Personal Stats Card */}
        {challengeStarted && userStats && (
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-card border border-gray-100/80">
            <div className="bg-gradient-ocean px-5 py-3 flex items-center justify-between">
              <p className="font-display text-white text-xl leading-tight">YOUR STATS</p>
              <Award size={20} className="text-white/80" />
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-wider">Rank</p>
                  <p className="font-display text-navy text-3xl leading-tight mt-1">
                    #{userStats.rank}
                  </p>
                  <p className="font-body text-xs text-gray-400">of {total}</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-wider">Steps</p>
                  <p className="font-display text-sw-pink text-3xl leading-tight mt-1">
                    {userStats.steps > 999 ? `${(userStats.steps/1000).toFixed(1)}k` : userStats.steps.toLocaleString()}
                  </p>
                  <p className="font-body text-xs text-gray-400">total</p>
                </div>
                <div className="text-center">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-wider">Weeks</p>
                  <p className="font-display text-sw-teal text-3xl leading-tight mt-1">
                    {userStats.weeksSubmitted}<span className="text-gray-300 text-xl">/4</span>
                  </p>
                  <p className="font-body text-xs text-gray-400">done</p>
                </div>
              </div>

              {/* Progress to leader */}
              {userStats.rank > 1 && userStats.leaderSteps > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-body text-gray-500 flex items-center gap-1">
                      <TrendingUp size={12} />
                      Progress to leader
                    </span>
                    <span className="font-body font-semibold text-navy">{progressPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-sunset rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
              {userStats.rank === 1 && (
                <div className="text-center bg-gold/10 border border-gold/30 rounded-xl py-2">
                  <p className="font-body text-sm text-gold-dark font-bold">👑 You're #1 — keep stepping!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leader cards */}
        {challengeStarted && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="h-1.5 bg-gradient-gold" />
              <div className="p-4">
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-2">🏆 Overall Leader</p>
                {overallLeader && overallLeaderName ? (
                  <>
                    <p className="font-display text-navy text-lg leading-tight truncate">{overallLeaderName.toUpperCase()}</p>
                    <p className="font-display text-gold-dark text-3xl leading-tight mt-1">{overallLeader.steps.toLocaleString()}</p>
                    <p className="font-body text-xs text-gray-400">total steps</p>
                  </>
                ) : (
                  <p className="font-body text-sm text-gray-400">No submissions yet!</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="h-1.5 bg-gradient-teal" />
              <div className="p-4">
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-2">
                  ⭐ Week {currentWeek ?? ''} Leader
                </p>
                {weekLeader && weekLeaderName ? (
                  <>
                    <p className="font-display text-navy text-lg leading-tight truncate">{weekLeaderName.toUpperCase()}</p>
                    <p className="font-display text-sw-teal text-3xl leading-tight mt-1">{weekLeaderSteps.toLocaleString()}</p>
                    <p className="font-body text-xs text-gray-400">this week</p>
                  </>
                ) : (
                  <p className="font-body text-sm text-gray-400">
                    {currentWeek ? 'No submissions yet!' : 'Challenge complete'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Participants + week info */}
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-navy flex items-center justify-center text-xl shadow-card">👥</div>
            <div>
              <p className="font-display text-navy text-2xl leading-tight">
                {total} CHALLENGER{total !== 1 ? 'S' : ''}
              </p>
              <p className="font-body text-xs text-gray-400">in the 2026 challenge</p>
            </div>
          </div>
          {currentWeekInfo && (
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-sw-teal/10 border border-sw-teal/30 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sw-teal animate-pulse" />
                <p className="font-body text-xs font-semibold text-sw-teal-dark">Week {currentWeek}</p>
              </div>
              <p className="font-body text-xs text-gray-400 mt-1">Until {formatDate(currentWeekInfo.end)}</p>
            </div>
          )}
        </div>

        {/* Quick action CTA */}
        <Link href="/steps">
          <div className="relative overflow-hidden bg-gradient-pink rounded-2xl p-5 flex items-center justify-between shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="font-display text-white text-2xl leading-tight drop-shadow-sm">ADD MY STEPS</p>
              <p className="font-body text-white/85 text-sm mt-0.5">
                {isMonday ? '🚨 Submit today! Deadline is midnight.' : 'Track your progress 👟'}
              </p>
            </div>
            <div className="relative flex items-center gap-1">
              <span className="text-4xl">👟</span>
              <ArrowRight size={20} className="text-white/80" />
            </div>
          </div>
        </Link>

        <PrizePoolCard participantCount={total} />
        <SueSaysCard />
        <RulesCard />
      </div>
    </div>
  );
}
