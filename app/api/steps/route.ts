import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getDaysInWeek } from '@/lib/dates';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const week = parseInt(searchParams.get('week') ?? '1');

  if (isNaN(week) || week < 1 || week > 4) {
    return NextResponse.json({ error: 'Invalid week number' }, { status: 400 });
  }

  const days = getDaysInWeek(week);

  const { data, error } = await supabase
    .from('daily_steps')
    .select('*')
    .eq('participant_id', session.id)
    .gte('entry_date', days[0])
    .lte('entry_date', days[6]);

  if (error) return NextResponse.json({ error: 'Failed to load steps' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const entry_date: string = body.entry_date ?? '';
  const steps: number = parseInt(body.steps ?? 0);

  if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }
  if (isNaN(steps) || steps < 0 || steps > 100_000) {
    return NextResponse.json({ error: 'Steps must be between 0 and 100,000' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('daily_steps')
    .upsert(
      { participant_id: session.id, entry_date, steps, updated_at: new Date().toISOString() },
      { onConflict: 'participant_id,entry_date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to save steps' }, { status: 500 });

  return NextResponse.json(data);
}
