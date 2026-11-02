import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { Enquiry, Yacht } from '@/models';
import { enquirySchema } from '@/lib/validate';
import { clientIp, limit } from '@/lib/ratelimit';
import { html, inbox, pushLead, sendMail } from '@/lib/mail';

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!limit(`enq:${ip}`, 4, 10 * 60_000)) return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  const parsed = enquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check your name and email address.' }, { status: 400 });
  const d = parsed.data;
  // Bots fill the honeypot or submit within two seconds of page load; pretend it worked.
  if (d.company || (d.ts && Date.now() - d.ts < 2000)) return NextResponse.json({ ok: true });

  await connect();
  const doc = await Enquiry.create({ ...d, ip, source: req.headers.get('referer') || undefined });
  const rows: [string, string | undefined][] = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Topic', d.topic], ['Yacht', d.yachtSlug], ['Message', d.message]];
  await Promise.all([
    sendMail({ to: inbox(d.topic), subject: `New ${d.topic} enquiry from ${d.name}`, html: html('New enquiry', rows), replyTo: d.email }),
    sendMail({ to: d.email, subject: 'We have received your enquiry', html: html(`Thank you, ${d.name}`, [], 'A broker will reply within one working day. Blackpearl Yachts.') }),
    pushLead({ type: 'enquiry', id: String(doc._id), ...d }),
  ]);
  // Gated particulars: the brochure link is released only after contact details are submitted.
  const y = d.yachtSlug ? await Yacht.findOne({ slug: d.yachtSlug, published: true }).select('brochureUrl').lean() : null;
  return NextResponse.json({ ok: true, brochureUrl: y?.brochureUrl });
}
