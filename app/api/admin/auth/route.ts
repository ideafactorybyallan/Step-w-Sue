import { NextResponse } from 'next/server';
import { createAdminToken, ADMIN_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPw = (process.env.ADMIN_PASSWORD ?? '').trim();
  const submitted = (password ?? '').trim();

  if (!adminPw || submitted !== adminPw) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const token = await createAdminToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE.name, token, ADMIN_COOKIE.opts);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('swc_admin');
  return res;
}
