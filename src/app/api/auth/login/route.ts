import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/lib/db';
import { User } from '@/models';
import { COOKIE, signSession } from '@/lib/auth';
import { clientIp, limit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!limit(`login:${clientIp(req)}`, 8, 10 * 60_000)) return NextResponse.json({ error: 'Too many attempts. Wait a few minutes.' }, { status: 429 });
  const { email, password } = await req.json().catch(() => ({}));
  await connect();
  const u = typeof email === 'string' ? await User.findOne({ email: email.toLowerCase() }) : null;
  const ok = u && typeof password === 'string' && (await bcrypt.compare(password, u.passwordHash));
  if (!u || !ok) return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  const token = await signSession({ sub: String(u._id), email: u.email, role: u.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 86400 });
  return res;
}
