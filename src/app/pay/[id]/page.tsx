import { connect } from '@/lib/db';
import { Booking } from '@/models';
import PayButton from '@/components/PayButton';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pay deposit', robots: { index: false } };

export default async function Pay({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string; paid?: string }> }) {
  const { id } = await params;
  const { token, paid } = await searchParams;
  await connect();
  const b = await Booking.findOne({ _id: id, payToken: token }).lean().catch(() => null);
  if (!b) notFound();
  return (
    <main className="wrap detail">
      <div className="eyebrow rl">Charter deposit</div>
      <h1 className="atitle">{b.yachtName}</h1>
      <dl className="specs2 num">
        <div><dt>Dates</dt><dd>{b.from.toISOString().slice(0, 10)} to {b.to.toISOString().slice(0, 10)}</dd></div>
        <div><dt>Estimated total</dt><dd>EUR {b.totalEUR?.toLocaleString('en-GB')}</dd></div>
        <div><dt>Deposit due</dt><dd>EUR {b.depositEUR?.toLocaleString('en-GB')}</dd></div>
      </dl>
      <div style={{ marginTop: 48 }}>
        {b.status === 'deposit-paid' || paid ? <p className="thanks" role="status">Deposit received. Your broker will send the charter agreement shortly.</p>
          : b.status === 'confirmed' ? <PayButton id={id} token={token!} /> : <p className="thanks">This booking is not ready for payment yet.</p>}
      </div>
    </main>
  );
}
