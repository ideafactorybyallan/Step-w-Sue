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
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to load announcements' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('announcements')
    .insert({ message: message.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  return NextResponse.json({ success: true });
}
