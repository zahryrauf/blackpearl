import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { Yacht } from '@/models';
import { quoteSchema } from '@/lib/validate';
import { quote } from '@/lib/pricing';

export async function POST(req: Request) {
  const p = quoteSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Choose a yacht and dates.' }, { status: 400 });
  const from = new Date(p.data.from), to = new Date(p.data.to);
  if (isNaN(+from) || isNaN(+to) || to <= from) return NextResponse.json({ error: 'The end date must be after the start date.' }, { status: 400 });
  await connect();
  const y = await Yacht.findOne({ slug: p.data.slug, kind: 'charter', published: true }).lean();
  if (!y?.weeklyRateEUR) return NextResponse.json({ error: 'Yacht not found.' }, { status: 404 });
  if (p.data.guests && y.guests && p.data.guests > y.guests) return NextResponse.json({ error: `This yacht sleeps ${y.guests} guests.` }, { status: 400 });
  const q = quote({ weeklyRateEUR: y.weeklyRateEUR, vatPct: y.vatPct ?? 0, apaPct: y.apaPct ?? 30, from, to });
  if (q.nights < 3) return NextResponse.json({ error: 'The minimum charter is three nights.' }, { status: 400 });
  return NextResponse.json({ ...q, vatPct: y.vatPct ?? 0, apaPct: y.apaPct ?? 30 });
}
