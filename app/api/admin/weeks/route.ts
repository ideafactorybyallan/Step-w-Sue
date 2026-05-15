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

  const { data, error } = await supabase.from('weeks').select('*').order('week_number');
  if (error) return NextResponse.json({ error: 'Failed to load weeks' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { week_number, is_locked, winner_override_id } = body;

  if (!week_number) return NextResponse.json({ error: 'Missing week_number' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (is_locked !== undefined) updates.is_locked = is_locked;
  if (winner_override_id !== undefined) updates.winner_override_id = winner_override_id || null;

  const { error } = await supabase.from('weeks').update(updates).eq('week_number', week_number);
  if (error) return NextResponse.json({ error: 'Failed to update week' }, { status: 500 });
  return NextResponse.json({ success: true });
}
