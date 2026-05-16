import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getWeekStatus, formatDate, WEEKS } from '@/lib/dates';
import { getParticipantTitle } from '@/lib/sue-says';
import { calculatePrizePool, fmt } from '@/lib/prizes';
import { LeaderboardClient } from './LeaderboardClient';
import type { Participant } from '@/lib/types';

async function getLeaderboardData() {
  const [pRes, sRes, wRes] = await Promise.all([
    supabase.from('participants').select('*').eq('is_active', true).eq('is_observer', false).order('first_name'),
    supabase.from('weekly_submissions').select('*'),
    supabase.from('weeks').select('*').order('week_number'),
  ]);

  const participants: Participant[] = pRes.data ?? [];
  const submissions = sRes.data ?? [];
  const weeks = wRes.data ?? [];
  const total = participants.length;

  type Acc = { steps: number; count: number; first_at: string | null; has_late: boolean };
  const acc = new Map<string, Acc>();
  participants.forEach((p) => acc.set(p.id, { steps: 0, count: 0, first_at: null, has_late: false }));
  submissions.forEach((s) => {
    const e = acc.get(s.participant_id);
    if (!e) return;
    e.steps += s.total_steps;
    e.count += 1;
    if (!e.first_at || s.submitted_at < e.first_at) e.first_at = s.submitted_at;
    if (s.is_late) e.has_late = true;
  });

  const overall = participants
    .map((p) => ({ participant: p, ...acc.get(p.id)! }))
    .sort((a, b) => {
      if (b.steps !== a.steps) return b.steps - a.steps;
      if (a.first_at && b.first_at) {
        if (a.first_at !== b.first_at) return a.first_at < b.first_at ? -1 : 1;
      } else if (a.first_at) return -1;
      else if (b.first_at) return 1;
      return a.participant.id < b.participant.id ? -1 : 1;
    })
    .map((e, i) => {
      const t = getParticipantTitle(i + 1, total, e.count > 0, e.has_late);
      return {
        participant: e.participant,
        total_steps: e.steps,
        weeks_submitted: e.count,
        rank: i + 1,
        title: t.label,
        title_emoji: t.emoji,
        has_late: e.has_late,
        first_submitted_at: e.first_at,
      };
    });

  const weekStandings = weeks.map((week) => {
    const wn = week.week_number;
    const subMap = new Map(
      submissions.filter((s) => s.week_number === wn).map((s) => [s.participant_id, s])
    );
    const entries = participants
      .map((p) => {
        const sub = subMap.get(p.id);
        return {
          participant: p,
          steps: sub?.total_steps ?? 0,
          is_submitted: !!sub,
          submitted_at: sub?.submitted_at ?? null,
          is_late: sub?.is_late ?? false,
        };
      })
      .sort((a, b) => {
        if (b.steps !== a.steps) return b.steps - a.steps;
        if (a.submitted_at && b.submitted_at) {
          if (a.submitted_at !== b.submitted_at) return a.submitted_at < b.submitted_at ? -1 : 1;
        } else if (a.submitted_at) return -1;
        else if (b.submitted_at) return 1;
        return a.participant.id < b.participant.id ? -1 : 1;
      })
      .map((e, i) => {
        const isWinner =
          week.is_locked &&
          (week.winner_override_id
            ? e.participant.id === week.winner_override_id
            : i === 0 && e.is_submitted);
        return { ...e, rank: i + 1, is_winner: isWinner };
      });

    let winner: Participant | null = null;
    if (week.is_locked) {
      if (week.winner_override_id) {
        winner = participants.find((p) => p.id === week.winner_override_id) ?? null;
      } else {
        const top = entries.find((e) => e.is_submitted);
        winner = top?.participant ?? null;
      }
    }

    return {
      week_number: wn,
      start: WEEKS[wn - 1].start,
      end: WEEKS[wn - 1].end,
      entries,
      is_locked: week.is_locked,
      winner,
      status: getWeekStatus(wn) as 'upcoming' | 'active' | 'past',
    };
  });

  return { overall, weekStandings, total };
}

export default async function LeaderboardPage() {
  const session = await getSession();
  const { overall, weekStandings, total } = await getLeaderboardData();
  const prizes = calculatePrizePool(total);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-navy px-6 pt-10 pb-6">
        <p className="font-body text-sw-teal text-xs font-bold tracking-widest uppercase mb-1">
          Live Standings
        </p>
        <p className="font-display text-sw-pink text-5xl leading-none">LEADER</p>
        <p className="font-display text-white text-4xl leading-none">BOARD</p>
      </div>

      <div className="px-4 pt-4 pb-6">
        <LeaderboardClient
          overall={overall}
          weekStandings={weekStandings}
          currentUserId={session?.id ?? null}
          prizes={prizes}
        />
      </div>
    </div>
  );
}
