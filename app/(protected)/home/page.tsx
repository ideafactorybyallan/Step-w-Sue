import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { SueSaysCard } from '@/components/SueSaysCard';
import { MondayBanner } from '@/components/MondayBanner';
import { CountdownCard } from '@/components/CountdownCard';
import { PrizesAndRulesCard } from '@/components/PrizesAndRulesCard';
import { LogoutButton } from '@/components/LogoutButton';
import { avatarBg, avatarFg } from '@/lib/avatar';
import {
  isMondayEDT,
  isChallengeStarted,
  isChallengeOver,
  getDaysRemaining,
  getCurrentWeekNumber,
} from '@/lib/dates';

async function getHomeData(currentUserId: string | null) {
  const [pRes, sRes, aRes] = await Promise.all([
    supabase.from('participants').select('*').eq('is_active', true).eq('is_observer', false),
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
      if (a.first_at && b.first_at) {
        if (a.first_at !== b.first_at) return a.first_at < b.first_at ? -1 : 1;
      } else if (a.first_at) return -1;
      else if (b.first_at) return 1;
      return a.participant.id < b.participant.id ? -1 : 1;
    });

  const overallLeader = sorted[0] ?? null;
  const secondPlace = sorted[1] ?? null;

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

  const totalGroupSteps = submissions.reduce((sum, s) => sum + s.total_steps, 0);

  return {
    total,
    overallLeader,
    secondPlace,
    weekLeader,
    weekLeaderSteps,
    currentWeek,
    announcements,
    userStats,
    totalGroupSteps,
  };
}

export default async function HomePage() {
  const session = await getSession();
  const {
    total,
    overallLeader,
    secondPlace,
    weekLeader,
    weekLeaderSteps,
    currentWeek,
    announcements,
    userStats,
    totalGroupSteps,
  } = await getHomeData(session?.id ?? null);

  const isMonday = isMondayEDT();
  const challengeStarted = isChallengeStarted();
  const challengeOver = isChallengeOver();
  const isObserver = Boolean(session?.is_observer);

  const overallLeaderName = overallLeader
    ? overallLeader.participant.nickname ?? `${overallLeader.participant.first_name} ${overallLeader.participant.last_name}`
    : null;

  const secondPlaceName = secondPlace
    ? secondPlace.participant.nickname ?? `${secondPlace.participant.first_name} ${secondPlace.participant.last_name}`
    : null;

  const weekLeaderName = weekLeader
    ? weekLeader.nickname ?? `${weekLeader.first_name} ${weekLeader.last_name}`
    : null;

  const userAvatarBg = session ? avatarBg(session.first_name, session.last_name) : '#E8234A';
  const userAvatarFg = avatarFg(userAvatarBg);

  const progressPct = userStats && userStats.leaderSteps > 0
    ? Math.min(100, Math.round((userStats.steps / userStats.leaderSteps) * 100))
    : 0;

  const gap = userStats ? Math.max(0, userStats.leaderSteps - userStats.steps) : 0;

  const gapState: 'leading' | 'close' | 'behind' =
    userStats?.rank === 1 ? 'leading' : progressPct >= 90 ? 'close' : 'behind';

  const daysLeft = getDaysRemaining();

  return (
    <div className="flex flex-col">
      {isMonday && challengeStarted && currentWeek !== null && currentWeek > 1 && <MondayBanner />}

      {/* Hero — personal identity */}
      <div className="bg-hero-navy px-6 pt-8 pb-7 relative overflow-hidden">
        <div className="absolute top-4 right-16 text-7xl opacity-[0.06] select-none pointer-events-none" aria-hidden="true">🍁</div>

        {/* Top bar: logout · branding · avatar */}
        <div className="flex items-center justify-between mb-6">
          <LogoutButton />
          <p className="font-body text-white/25 text-xs tracking-[0.2em] uppercase">Step w Sue</p>
          {session && (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-body font-bold text-sm border-2 border-white/20 shrink-0"
              style={{ backgroundColor: userAvatarBg, color: userAvatarFg }}
            >
              {session.first_name.charAt(0).toUpperCase()}{session.last_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        {session && (
          <div>
            <p className="font-body text-white/40 text-xs tracking-[0.2em] uppercase mb-1">Welcome back</p>
            <p className="font-display text-white text-5xl leading-none">{session.first_name.toUpperCase()}</p>
            <p className="font-display text-sw-pink text-5xl leading-none">{session.last_name.toUpperCase()}</p>
          </div>
        )}

        {/* Status row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {isObserver && (
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <span className="text-sm" aria-hidden="true">👀</span>
              <span className="font-body text-white font-semibold text-xs tracking-wide">OBSERVER</span>
            </div>
          )}
          {!isObserver && challengeStarted && userStats && (
            <div className="flex items-center gap-1.5 bg-sw-teal/20 border border-sw-teal/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sw-teal animate-pulse shrink-0" />
              <span className="font-body text-white font-semibold text-xs">#{userStats.rank} of {total}</span>
            </div>
          )}
          {challengeStarted && !challengeOver && currentWeek && (
            <p className="font-body text-white/40 text-xs">
              Week {currentWeek} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </p>
          )}
          {!challengeStarted && (
            <p className="font-body text-white/40 text-xs">Victoria Day Step Challenge 2026</p>
          )}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="bg-gold/15 border border-gold/40 rounded-xl p-4 flex items-start gap-2 animate-fade-up">
              <span className="text-base shrink-0">📢</span>
              <p className="font-body text-navy text-sm font-medium">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-3 pb-6 space-y-4 stagger-children">

        {/* Pre-challenge: countdown is the hero */}
        {!challengeStarted && <CountdownCard />}

        {/* Stat hero card */}
        {!isObserver && challengeStarted && userStats && (
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-sw-pink text-6xl leading-none">
                {userStats.steps.toLocaleString()}
              </p>
              <span className="bg-navy text-white font-body font-bold text-sm rounded-full px-3 py-1 shrink-0">
                #{userStats.rank}
              </span>
            </div>

            {userStats.rank === 1 && (
              <p className="font-body font-semibold text-gold-dark text-sm mb-3">👑 You&apos;re leading!</p>
            )}

            {userStats.rank > 1 && userStats.leaderSteps > 0 && (
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sw-pink to-gold rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="font-body text-xs text-gray-400 mt-1">
                  {progressPct}% of {overallLeaderName}&apos;s total
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <p className="font-body text-xs text-gray-400">{userStats.weeksSubmitted}/4 weeks submitted</p>
              {!challengeOver && (
                <p className="font-body text-xs text-gray-400">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
              )}
            </div>
          </div>
        )}

        {/* Gap / motivation card */}
        {!isObserver && challengeStarted && userStats && total > 1 && (
          <div className={`bg-white rounded-2xl p-4 border-l-4 ${
            gapState === 'leading' ? 'border-gold' :
            gapState === 'close' ? 'border-sw-teal' :
            'border-sw-pink'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">
                {gapState === 'leading' ? '👑' : gapState === 'close' ? '🎯' : '💪'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-navy text-2xl leading-none">
                  {gapState === 'leading' ? "YOU'RE LEADING" : gapState === 'close' ? 'SO CLOSE' : 'KEEP CLIMBING'}
                </p>
                <p className="font-body text-sm text-gray-500 mt-1 leading-relaxed">
                  {gapState === 'leading' && secondPlaceName
                    ? `${secondPlaceName} is ${gap.toLocaleString()} steps behind — don't slow down`
                    : gapState === 'leading'
                    ? "You're out in front — keep those steps coming!"
                    : gapState === 'close'
                    ? `${gap.toLocaleString()} steps behind ${overallLeaderName}`
                    : `${progressPct}% of ${overallLeaderName}'s steps · ${gap.toLocaleString()} to catch up`
                  }
                </p>
                {gapState !== 'leading' && (
                  <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        gapState === 'close' ? 'bg-sw-teal' : 'bg-gradient-to-r from-sw-pink to-gold'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Primary CTA — participants get ADD MY STEPS, observers get VIEW STANDINGS */}
        {isObserver ? (
          <Link href="/leaderboard">
            <div className="relative overflow-hidden bg-gradient-ocean rounded-2xl p-5 flex items-center justify-between shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <p className="font-display text-white text-2xl leading-tight drop-shadow-sm">VIEW STANDINGS</p>
                <p className="font-body text-white/85 text-sm mt-0.5">You&apos;re observing — cheer them on!</p>
              </div>
              <div className="relative flex items-center gap-1">
                <span className="text-4xl" aria-hidden="true">👀</span>
                <ChevronRight size={20} className="text-white/80" />
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/steps" className="mt-2 block">
            <div className="relative overflow-hidden bg-gradient-pink rounded-2xl p-5 flex items-center justify-between shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <p className="font-display text-white text-2xl leading-tight drop-shadow-sm">ADD MY STEPS</p>
                <p className="font-body text-white/85 text-sm mt-0.5">
                  {isMonday && currentWeek !== null && currentWeek > 1
                    ? '🚨 Submit today! Deadline is midnight.'
                    : 'Track your daily progress'}
                </p>
              </div>
              <div className="relative flex items-center gap-1">
                <span className="text-4xl" aria-hidden="true">🏃</span>
                <ChevronRight size={20} className="text-white/80" />
              </div>
            </div>
          </Link>
        )}

        {/* Community strip — challengers + group total */}
        {challengeStarted && (
          <div className="bg-white rounded-2xl shadow-card p-4 flex items-center">
            <div className="flex-1 text-center">
              <p className="font-display text-navy text-3xl leading-none">{total}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Challenger{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-px bg-gray-100 self-stretch" />
            <div className="flex-1 text-center">
              <p className="font-display text-sw-pink text-3xl leading-none">
                {totalGroupSteps >= 1_000_000
                  ? `${(totalGroupSteps / 1_000_000).toFixed(1)}M`
                  : totalGroupSteps >= 1000
                  ? `${(totalGroupSteps / 1000).toFixed(0)}K`
                  : totalGroupSteps > 0
                  ? totalGroupSteps.toLocaleString()
                  : '—'}
              </p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Group steps</p>
            </div>
          </div>
        )}

        {/* Standings preview */}
        {challengeStarted && (overallLeaderName || weekLeaderName) && (
          <Link href="/leaderboard">
            <div className="bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">Standings</p>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-gold shrink-0" />
                  <p className="font-body text-sm font-semibold text-navy flex-1 truncate">
                    Overall · {overallLeaderName ?? 'No entries yet'}
                  </p>
                  <p className="font-display text-lg text-navy shrink-0">
                    {overallLeader && overallLeader.steps > 0 ? overallLeader.steps.toLocaleString() : '—'}
                  </p>
                </div>
                {currentWeek !== null && (
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-sw-teal shrink-0" />
                    <p className="font-body text-sm font-semibold text-navy flex-1 truncate">
                      Week {currentWeek} · {weekLeaderName ?? 'No entries yet'}
                    </p>
                    <p className="font-display text-lg text-navy shrink-0">
                      {weekLeaderSteps > 0 ? weekLeaderSteps.toLocaleString() : '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Post-challenge: CountdownCard done state */}
        {challengeOver && <CountdownCard />}

        <PrizesAndRulesCard participantCount={total} />
        <SueSaysCard />
      </div>
    </div>
  );
}
