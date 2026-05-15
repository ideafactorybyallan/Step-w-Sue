import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
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

  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .order('created_at');

  if (pErr) return NextResponse.json({ error: 'Failed to load participants' }, { status: 500 });

  const { data: submissions } = await supabase
    .from('weekly_submissions')
    .select('participant_id, week_number, total_steps, is_late, is_locked, submitted_at');

  const result = (participants ?? []).map((p) => ({
    ...p,
    submissions: (submissions ?? []).filter((s) => s.participant_id === p.id),
  }));

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { id, action, new_pin, nickname, is_active } = body;

  if (!id) return NextResponse.json({ error: 'Missing participant id' }, { status: 400 });

  if (action === 'reset_pin') {
    if (!new_pin || !/^\d{4,6}$/.test(String(new_pin))) {
      return NextResponse.json({ error: 'PIN must be 4–6 digits.' }, { status: 400 });
    }
    const pin_hash = await hash(String(new_pin), 10);
    const { error } = await supabase
      .from('participants')
      .update({ pin_hash })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to reset PIN' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'toggle_active') {
    const { data: p } = await supabase.from('participants').select('is_active').eq('id', id).single();
    const { error } = await supabase
      .from('participants')
      .update({ is_active: !p?.is_active })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Generic field updates
  const updates: Record<string, unknown> = {};
  if (nickname !== undefined) updates.nickname = nickname || null;
  if (is_active !== undefined) updates.is_active = is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { error } = await supabase.from('participants').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Soft delete
  const { error } = await supabase.from('participants').update({ is_active: false }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  return NextResponse.json({ success: true });
}
