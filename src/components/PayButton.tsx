'use client';
import { useState } from 'react';
export default function PayButton({ id, token }: { id: string; token: string }) {
  const [err, setErr] = useState('');
  async function go() {
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, token }) });
    const j = await r.json();
    if (j.url) window.location.href = j.url; else setErr(j.error || 'Payment is unavailable.');
  }
  return <><button className="send" type="button" onClick={go}>Pay deposit securely</button>{err && <p className="thanks" role="alert">{err}</p>}</>;
}
