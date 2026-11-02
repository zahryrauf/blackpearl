'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [msg, setMsg] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), company: f.get('company') || undefined }) }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    setMsg(r?.ok ? 'Subscribed. Check your inbox.' : j?.error || 'Could not subscribe.');
    if (r?.ok) (e.target as HTMLFormElement).reset();
  }
  return (
    <form className="news" onSubmit={submit}>
      <label className="fld" htmlFor="nl-email">Market notes and new listings<input id="nl-email" name="email" type="email" placeholder="Your email address" required /></label>
      <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="send" type="submit">Subscribe</button>
      {msg && <p className="thanks" role="status">{msg}</p>}
    </form>
  );
}
