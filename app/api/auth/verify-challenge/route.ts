import { NextResponse } from 'next/server';
import { CHALLENGE_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const password: string = (body.password ?? '').trim();

  const challenge = (process.env.CHALLENGE_PASSWORD ?? '').toLowerCase();

  if (!challenge) {
    return NextResponse.json(
      { error: 'Challenge password is not configured. Contact the admin.' },
      { status: 503 }
    );
  }

  if (password.toLowerCase() !== challenge) {
    return NextResponse.json(
      { error: 'Wrong password — give it another shot! 🤔' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(CHALLENGE_COOKIE.name, 'verified', CHALLENGE_COOKIE.opts);
  return res;
}
