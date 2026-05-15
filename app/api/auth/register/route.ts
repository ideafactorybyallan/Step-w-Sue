import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE, CHALLENGE_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const jar = await cookies();

  // Must have verified the challenge password first
  if (jar.get(CHALLENGE_COOKIE.name)?.value !== 'verified') {
    return NextResponse.json({ error: 'Challenge password not verified' }, { status: 401 });
  }

  const body = await request.json();
  const first_name: string = (body.first_name ?? '').trim();
  const last_name: string = (body.last_name ?? '').trim();
  const nickname: string | null = (body.nickname ?? '').trim() || null;
  const pin: string = String(body.pin ?? '').trim();

  if (!first_name || !last_name) {
    return NextResponse.json({ error: 'First and last name are required.' }, { status: 400 });
  }

  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4 digits.' }, { status: 400 });
  }

  // Prevent duplicate names
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .ilike('first_name', first_name)
    .ilike('last_name', last_name)
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'An account with that name already exists — try signing in instead!' },
      { status: 409 }
    );
  }

  const pin_hash = await hash(pin, 10);

  const { data: participant, error } = await supabase
    .from('participants')
    .insert({ first_name, last_name, nickname, pin_hash })
    .select()
    .single();

  if (error || !participant) {
    console.error('Register error:', JSON.stringify(error));
    return NextResponse.json({ error: error?.message ?? 'Could not create account — please try again.' }, { status: 500 });
  }

  const token = await createSessionToken({
    id: participant.id,
    first_name: participant.first_name,
    last_name: participant.last_name,
    nickname: participant.nickname,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.opts);
  res.cookies.delete(CHALLENGE_COOKIE.name);
  return res;
}
