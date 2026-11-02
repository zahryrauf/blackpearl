'use client';
import { useRef, useState } from 'react';

export default function EnquiryForm({ topic = 'buy', yachtSlug, compact = false }: { topic?: string; yachtSlug?: string; compact?: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string; pdf?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const t0 = useRef(Date.now());
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const r = await fetch('/api/enquiries', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: f.get('name'), email: f.get('email'), phone: f.get('phone') || undefined, topic: f.get('topic'), message: f.get('message') || undefined, yachtSlug, company: f.get('company') || undefined, ts: t0.current }),
    }).catch(() => null);
    setBusy(false);
    const j = await r?.json().catch(() => ({}));
    if (r?.ok) { setMsg({ ok: true, text: `Thank you, ${f.get('name')}. A broker will reply within one working day.`, pdf: j?.brochureUrl }); (e.target as HTMLFormElement).reset(); }
    else setMsg({ ok: false, text: j?.error || 'Something went wrong. Please try again.' });
  }
  return (
    <form onSubmit={submit} noValidate={false}>
      <div className="two">
        <label className="fld" htmlFor={`nm-${topic}`}>Name<input id={`nm-${topic}`} name="name" autoComplete="name" required /></label>
        <label className="fld" htmlFor={`em-${topic}`}>Email<input id={`em-${topic}`} name="email" type="email" autoComplete="email" required /></label>
      </div>
      {!compact && <label className="fld" htmlFor={`ph-${topic}`}>Phone<input id={`ph-${topic}`} name="phone" autoComplete="tel" /></label>}
      <label className="fld" htmlFor={`tp-${topic}`}>Interested in
        <select id={`tp-${topic}`} name="topic" defaultValue={topic}>
          <option value="buy">Buying a yacht</option><option value="sell">Selling a yacht</option><option value="charter">Chartering</option><option value="general">Something else</option>
        </select>
      </label>
      <label className="fld" htmlFor={`ms-${topic}`}>Message<textarea id={`ms-${topic}`} name="message" placeholder="Length, budget, region, dates" /></label>
      <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="send" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send enquiry'}</button>
      {msg && <p className="thanks" role="status" style={msg.ok ? undefined : { borderColor: 'crimson' }}>{msg.text}{msg.pdf && <> <a href={msg.pdf} target="_blank" rel="noopener noreferrer">Download the brochure</a>.</>}</p>}
    </form>
  );
}
