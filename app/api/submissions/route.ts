import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isLateSubmission } from '@/lib/dates';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data, error } = await supabase
    .from('weekly_submissions')
    .select('*')
    .eq('participant_id', session.id)
    .order('week_number');

  if (error) return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.is_observer) {
    return NextResponse.json({ error: 'Observers cannot submit steps.' }, { status: 403 });
  }

  const body = await request.json();
  const week_number: number = parseInt(body.week_number ?? 0);
  const total_steps: number = parseInt(body.total_steps ?? 0);

  if (!week_number || week_number < 1 || week_number > 4) {
    return NextResponse.json({ error: 'Invalid week number' }, { status: 400 });
  }
  if (isNaN(total_steps) || total_steps < 0 || total_steps > 1_000_000) {
    return NextResponse.json({ error: 'Step count must be between 0 and 1,000,000' }, { status: 400 });
  }

  // Check if the week itself is locked by admin
  const { data: weekRow } = await supabase
    .from('weeks')
    .select('is_locked')
    .eq('week_number', week_number)
    .single();

  if (weekRow?.is_locked) {
    return NextResponse.json(
      { error: 'This week has been locked by the admin — contact them to unlock it.' },
      { status: 403 }
    );
  }

  // Check for an existing submission
  const { data: existing } = await supabase
    .from('weekly_submissions')
    .select('id, is_locked')
    .eq('participant_id', session.id)
    .eq('week_number', week_number)
    .maybeSingle();

  if (existing?.is_locked) {
    return NextResponse.json(
      { error: 'Your submission is locked — contact the admin to make changes.' },
      { status: 403 }
    );
  }

  const is_late = isLateSubmission(week_number);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('weekly_submissions')
    .upsert(
      { participant_id: session.id, week_number, total_steps, is_late, updated_at: now },
      { onConflict: 'participant_id,week_number' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to submit steps' }, { status: 500 });
  return NextResponse.json(data);
}
