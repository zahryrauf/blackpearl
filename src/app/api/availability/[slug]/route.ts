import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { Booking, Yacht } from '@/models';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connect();
  const y = await Yacht.findOne({ slug, kind: 'charter' }).lean();
  if (!y) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const bookings = await Booking.find({ yachtSlug: slug, status: { $in: ['confirmed', 'deposit-paid'] }, to: { $gte: new Date() } }).select('from to').lean();
  const booked = [...(y.blocked || []).map((b) => ({ from: b.from, to: b.to })), ...bookings.map((b) => ({ from: b.from, to: b.to }))];
  return NextResponse.json({ booked });
}
