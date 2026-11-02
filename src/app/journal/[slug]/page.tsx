import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/data';

export const dynamic = 'force-dynamic';
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = await getArticle((await params).slug).catch(() => null);
  return a ? { title: a.title, description: a.excerpt } : {};
}
export default async function Article({ params }: P) {
  const a = await getArticle((await params).slug).catch(() => null);
  if (!a) notFound();
  return (
    <main className="wrap detail">
      <div className="eyebrow rl">{a.category} · {new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <h1 className="atitle">{a.title}</h1>
      <article className="prose">{(a.body || a.excerpt || '').split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</article>
    </main>
  );
}
