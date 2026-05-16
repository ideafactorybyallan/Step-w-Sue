import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function checkAdmin() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { data, error } = await supabase
    .from('weekly_submissions')
    .select('*, participants(first_name, last_name, nickname)')
    .order('week_number')
    .order('submitted_at');

  if (error) return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { id, action, total_steps } = body;

  if (!id) return NextResponse.json({ error: 'Missing submission id' }, { status: 400 });

  if (action === 'toggle_lock') {
    const { data: sub } = await supabase
      .from('weekly_submissions')
      .select('is_locked')
      .eq('id', id)
      .single();
    const { error } = await supabase
      .from('weekly_submissions')
      .update({ is_locked: !sub?.is_locked })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to toggle lock' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Override step total
  if (total_steps !== undefined) {
    const steps = parseInt(total_steps);
    if (isNaN(steps) || steps < 0) {
      return NextResponse.json({ error: 'Invalid step total' }, { status: 400 });
    }
    const { data: row } = await supabase
      .from('weekly_submissions')
      .select('is_locked')
      .eq('id', id)
      .single();
    if (row?.is_locked) {
      return NextResponse.json(
        { error: 'Submission is locked. Unlock it first to edit.' },
        { status: 409 }
      );
    }
    const { error } = await supabase
      .from('weekly_submissions')
      .update({ total_steps: steps, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to update steps' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
}
