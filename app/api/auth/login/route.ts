import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const participant_id: string = body.participant_id ?? '';
  const pin: string = String(body.pin ?? '').trim();

  if (!participant_id || !pin) {
    return NextResponse.json({ error: 'Participant and PIN are required.' }, { status: 400 });
  }

  const { data: participant, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participant_id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !participant) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  }

  const valid = await compare(pin, participant.pin_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Wrong PIN — try again! 🔢' }, { status: 401 });
  }

  const token = await createSessionToken({
    id: participant.id,
    first_name: participant.first_name,
    last_name: participant.last_name,
    nickname: participant.nickname,
    is_observer: Boolean(participant.is_observer),
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.opts);
  return res;
}
