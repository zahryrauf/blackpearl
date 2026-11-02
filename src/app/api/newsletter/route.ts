import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { Subscriber } from '@/models';
import { subscribeSchema } from '@/lib/validate';
import { clientIp, limit } from '@/lib/ratelimit';
import { html, sendMail } from '@/lib/mail';

export async function POST(req: Request) {
  if (!limit(`news:${clientIp(req)}`, 5, 10 * 60_000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  const p = subscribeSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (p.data.company) return NextResponse.json({ ok: true });
  await connect();
  const res = await Subscriber.updateOne({ email: p.data.email.toLowerCase() }, { $setOnInsert: { interests: p.data.interests || [] }, $set: { active: true } }, { upsert: true });
  if (res.upsertedCount) await sendMail({ to: p.data.email, subject: 'Welcome to the Blackpearl journal', html: html('Welcome', [], 'You will receive market notes and new listings that match your interests.') });
  return NextResponse.json({ ok: true });
}
