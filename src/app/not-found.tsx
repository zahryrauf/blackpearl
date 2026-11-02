import Link from 'next/link';
export default function NotFound() {
  return <main className="wrap detail"><div className="eyebrow rl">404</div><h1 className="atitle">This page has left port</h1><p style={{ marginTop: 24 }}><Link className="link" href="/">Return home</Link></p></main>;
}
