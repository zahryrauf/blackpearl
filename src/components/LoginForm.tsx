'use client';
import { useState } from 'react';
export default function LoginForm() {
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), password: f.get('password') }) });
    if (r.ok) window.location.href = '/admin'; else setErr((await r.json()).error);
  }
  return (
    <form onSubmit={submit}>
      <label className="fld" htmlFor="l-email">Email<input id="l-email" name="email" type="email" autoComplete="username" required /></label>
      <label className="fld" htmlFor="l-pass">Password<input id="l-pass" name="password" type="password" autoComplete="current-password" required /></label>
      <button className="send" type="submit">Sign in</button>
      {err && <p className="thanks" role="alert">{err}</p>}
    </form>
  );
}
