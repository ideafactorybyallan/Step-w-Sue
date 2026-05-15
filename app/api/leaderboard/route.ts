import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getWeekStatus } from '@/lib/dates';
import { getParticipantTitle } from '@/lib/sue-says';
import type { LeaderboardData, Participant } from '@/lib/types';

export async function GET() {
  const [pResult, sResult, wResult] = await Promise.all([
    supabase.from('participants').select('*').eq('is_active', true).order('first_name'),
    supabase.from('weekly_submissions').select('*'),
    supabase.from('weeks').select('*').order('week_number'),
  ]);

  const participants: Participant[] = pResult.data ?? [];
  const submissions = sResult.data ?? [];
  const weeks = wResult.data ?? [];
  const total = participants.length;

  // ── Overall standings ──────────────────────────────────────────────────────
  type Acc = { steps: number; count: number; first_at: string | null; has_late: boolean };
  const acc = new Map<string, Acc>();
  participants.forEach((p) => acc.set(p.id, { steps: 0, count: 0, first_at: null, has_late: false }));

  submissions.forEach((s) => {
    const entry = acc.get(s.participant_id);
    if (!entry) return;
    entry.steps += s.total_steps;
    entry.count += 1;
    if (!entry.first_at || s.submitted_at < entry.first_at) entry.first_at = s.submitted_at;
    if (s.is_late) entry.has_late = true;
  });

  const overall = participants
    .map((p) => ({ participant: p, ...acc.get(p.id)! }))
    .sort((a, b) => {
      if (b.steps !== a.steps) return b.steps - a.steps;
      if (a.first_at && b.first_at) return a.first_at < b.first_at ? -1 : 1;
      if (a.first_at) return -1;
      if (b.first_at) return 1;
      return 0;
    })
    .map((entry, i) => {
      const titleObj = getParticipantTitle(i + 1, total, entry.count > 0, entry.has_late);
      return {
        participant: entry.participant,
        total_steps: entry.steps,
        weeks_submitted: entry.count,
        rank: i + 1,
        title: titleObj.label,
        title_emoji: titleObj.emoji,
        has_late: entry.has_late,
        first_submitted_at: entry.first_at,
      };
    });

  // ── Weekly standings ───────────────────────────────────────────────────────
  const weekStandings: LeaderboardData['weeks'] = {};

  for (const week of weeks) {
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
        if (a.submitted_at && b.submitted_at) return a.submitted_at < b.submitted_at ? -1 : 1;
        if (a.submitted_at) return -1;
        if (b.submitted_at) return 1;
        return 0;
      })
      .map((entry, i) => {
        const isWinner =
          week.is_locked &&
          (week.winner_override_id
            ? entry.participant.id === week.winner_override_id
            : i === 0 && entry.is_submitted);
        return { ...entry, rank: i + 1, is_winner: isWinner };
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

    weekStandings[wn] = {
      entries,
      is_locked: week.is_locked,
      winner,
      status: getWeekStatus(wn),
    };
  }

  const data: LeaderboardData = {
    overall,
    weeks: weekStandings,
    participant_count: total,
  };

  return NextResponse.json(data);
}
