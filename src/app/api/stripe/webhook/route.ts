import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connect } from '@/lib/db';
import { Booking } from '@/models';
import { html, inbox, sendMail } from '@/lib/mail';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY, wh = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !wh) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') || '', wh);
  } catch {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    await connect();
    const b = await Booking.findByIdAndUpdate(s.metadata?.bookingId, { status: 'deposit-paid', paidAt: new Date() }, { new: true });
    if (b) {
      await sendMail({ to: b.email, subject: `Deposit received for ${b.yachtName}`, html: html('Deposit received', [['Yacht', b.yachtName ?? undefined], ['Amount', `EUR ${b.depositEUR?.toLocaleString('en-GB')}`]], 'Your charter is confirmed. Your broker will send the charter agreement shortly.') });
      await sendMail({ to: inbox('charter'), subject: `Deposit paid: ${b.yachtName}`, html: html('Deposit paid', [['Client', b.name], ['Yacht', b.yachtName ?? undefined]]) });
    }
  }
  return NextResponse.json({ received: true });
}
