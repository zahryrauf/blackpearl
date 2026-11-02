'use client';
import { useEffect, useRef, useState } from 'react';
import Calendar from './Calendar';
import { Price } from './Currency';

type Q = { nights: number; charterFee: number; vat: number; apa: number; total: number; deposit: number; depositPct: number; vatPct: number; apaPct: number };

export default function BookingPanel({ slug, maxGuests }: { slug: string; maxGuests?: number }) {
  const [booked, setBooked] = useState<{ from: string; to: string }[]>([]);
  const [q, setQ] = useState<Q | null>(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { fetch(`/api/availability/${slug}`).then((r) => r.json()).then((j) => setBooked(j.booked || [])).catch(() => {}); }, [slug]);

  const read = () => {
    const f = new FormData(form.current!);
    return { slug, from: String(f.get('from')), to: String(f.get('to')), guests: Number(f.get('guests')) || undefined, f };
  };
  async function getQuote() {
    setErr(''); setQ(null); setDone('');
    const { f, ...body } = read();
    if (!body.from || !body.to) return setErr('Choose your start and end dates.');
    const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    r.ok ? setQ(j) : setErr(j.error);
    void f;
  }
  async function request(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    const { f, ...body } = read();
    const r = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, name: f.get('name'), email: f.get('email'), phone: f.get('phone') || undefined, message: f.get('message') || undefined, company: f.get('company') || undefined }) });
    const j = await r.json();
    if (r.ok) { setDone('Request sent. A broker will confirm availability within one working day. Your dates are not held until then.'); form.current?.reset(); setQ(null); }
    else setErr(j.error);
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <Calendar booked={booked} />
      <form ref={form} onSubmit={request} className="booking">
        <div className="two">
          <label className="fld" htmlFor="b-from">From<input id="b-from" name="from" type="date" min={today} required /></label>
          <label className="fld" htmlFor="b-to">To<input id="b-to" name="to" type="date" min={today} required /></label>
        </div>
        <label className="fld" htmlFor="b-guests">Guests<input id="b-guests" name="guests" type="number" min={1} max={maxGuests || 30} defaultValue={2} /></label>
        <button className="link" type="button" onClick={getQuote} style={{ justifySelf: 'start', background: 'none', border: 0, borderBottom: '1px solid currentColor', color: 'inherit', cursor: 'pointer' }}>Estimate cost</button>
        {q && (
          <dl className="quote num">
            <div><dt>Charter fee · {q.nights} nights</dt><dd><Price eur={q.charterFee} /></dd></div>
            {q.vat > 0 && <div><dt>VAT {q.vatPct}%</dt><dd><Price eur={q.vat} /></dd></div>}
            <div><dt>Expenses allowance {q.apaPct}%</dt><dd><Price eur={q.apa} /></dd></div>
            <div className="tot"><dt>Estimated total</dt><dd><Price eur={q.total} /></dd></div>
            <div><dt>Deposit to hold dates ({q.depositPct}%)</dt><dd><Price eur={q.deposit} /></dd></div>
          </dl>
        )}
        <div className="two">
          <label className="fld" htmlFor="b-name">Name<input id="b-name" name="name" autoComplete="name" required /></label>
          <label className="fld" htmlFor="b-email">Email<input id="b-email" name="email" type="email" autoComplete="email" required /></label>
        </div>
        <label className="fld" htmlFor="b-phone">Phone<input id="b-phone" name="phone" autoComplete="tel" /></label>
        <label className="fld" htmlFor="b-msg">Message<textarea id="b-msg" name="message" placeholder="Occasion, itinerary, special requests" /></label>
        <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="send" type="submit">Request these dates</button>
        {err && <p className="thanks" role="alert" style={{ borderColor: 'crimson' }}>{err}</p>}
        {done && <p className="thanks" role="status">{done}</p>}
      </form>
    </div>
  );
}
