import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { connect } from '@/lib/db';
import { Booking, Yacht } from '@/models';
import { bookingSchema } from '@/lib/validate';
import { quote } from '@/lib/pricing';
import { clientIp, limit } from '@/lib/ratelimit';
import { html, inbox, pushLead, sendMail } from '@/lib/mail';
import { overlaps } from '@/lib/util';

export async function POST(req: Request) {
  if (!limit(`book:${clientIp(req)}`, 3, 10 * 60_000)) return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  const p = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Check your name, email and dates.' }, { status: 400 });
  const d = p.data;
  if (d.company) return NextResponse.json({ ok: true });
  const from = new Date(d.from), to = new Date(d.to);
  if (isNaN(+from) || isNaN(+to) || to <= from || from < new Date()) return NextResponse.json({ error: 'Choose valid future dates.' }, { status: 400 });

  await connect();
  const y = await Yacht.findOne({ slug: d.slug, kind: 'charter', published: true }).lean();
  if (!y?.weeklyRateEUR) return NextResponse.json({ error: 'Yacht not found.' }, { status: 404 });
  const taken = await Booking.find({ yachtSlug: d.slug, status: { $in: ['confirmed', 'deposit-paid'] } }).select('from to').lean();
  const clash = [...taken, ...(y.blocked || [])].some((b) => b.from && b.to && overlaps(from, to, b.from, b.to));
  if (clash) return NextResponse.json({ error: 'Those dates are not available.' }, { status: 409 });

  const q = quote({ weeklyRateEUR: y.weeklyRateEUR, vatPct: y.vatPct ?? 0, apaPct: y.apaPct ?? 30, from, to });
  if (q.nights < 3) return NextResponse.json({ error: 'The minimum charter is three nights.' }, { status: 400 });
  const b = await Booking.create({ yachtSlug: y.slug, yachtName: y.name, name: d.name, email: d.email, phone: d.phone, from, to, guests: d.guests, message: d.message, totalEUR: q.total, depositEUR: q.deposit, payToken: randomBytes(18).toString('hex') });

  const rows: [string, string | undefined][] = [['Yacht', y.name], ['Dates', `${d.from} to ${d.to} (${q.nights} nights)`], ['Guests', String(d.guests ?? '')], ['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Estimated total', `EUR ${q.total.toLocaleString('en-GB')}`], ['Message', d.message]];
  await Promise.all([
    sendMail({ to: inbox('charter'), subject: `Charter request: ${y.name}`, html: html('New charter request', rows), replyTo: d.email }),
    sendMail({ to: d.email, subject: `Your charter request for ${y.name}`, html: html(`Thank you, ${d.name}`, rows.slice(0, 3), 'Your dates are not held until a broker confirms them. We will reply within one working day.') }),
    pushLead({ type: 'booking', id: String(b._id), yacht: y.name, from: d.from, to: d.to, email: d.email }),
  ]);
  return NextResponse.json({ ok: true });
}
