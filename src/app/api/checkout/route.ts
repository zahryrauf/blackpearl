import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connect } from '@/lib/db';
import { Booking } from '@/models';
import { siteUrl } from '@/lib/util';

// Creates a Stripe Checkout session for the deposit of a confirmed booking.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: 'Online payment is not enabled.' }, { status: 503 });
  const { id, token } = await req.json().catch(() => ({}));
  await connect();
  const b = await Booking.findOne({ _id: id, payToken: token }).catch(() => null);
  if (!b || b.status !== 'confirmed' || !b.depositEUR) return NextResponse.json({ error: 'This booking is not ready for payment.' }, { status: 400 });
  const stripe = new Stripe(key);
  const s = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: b.email,
    line_items: [{ quantity: 1, price_data: { currency: 'eur', unit_amount: Math.round(b.depositEUR * 100), product_data: { name: `Charter deposit: ${b.yachtName}` } } }],
    metadata: { bookingId: String(b._id) },
    success_url: `${siteUrl()}/pay/${b._id}?token=${token}&paid=1`,
    cancel_url: `${siteUrl()}/pay/${b._id}?token=${token}`,
  });
  b.stripeSessionId = s.id;
  await b.save();
  return NextResponse.json({ url: s.url });
}
