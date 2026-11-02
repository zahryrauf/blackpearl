import { connect } from '@/lib/db';
import { Article, Yacht } from '@/models';
import { plain } from '@/lib/util';

export type Y = {
  _id: string; kind: 'sale' | 'charter'; slug: string; name: string; type: string; builder?: string; year?: number;
  lengthM: number; beamM?: number; draftM?: number; grossTonnage?: number; guests?: number; cabins?: number; crew?: number;
  region?: string; season?: string; description?: string; priceEUR?: number; status?: string; weeklyRateEUR?: number;
  vatPct?: number; apaPct?: number; images?: string[]; brochureUrl?: string; palette: string; sceneX: number; sceneW: number; featured?: boolean;
};
export type A = { _id: string; slug: string; title: string; category: string; excerpt?: string; body?: string; publishedAt: string };

export async function listYachts(kind: 'sale' | 'charter'): Promise<Y[]> {
  await connect();
  return plain(await Yacht.find({ kind, published: true }).sort({ order: 1, createdAt: -1 }).lean()) as unknown as Y[];
}
export async function getYacht(kind: 'sale' | 'charter', slug: string): Promise<Y | null> {
  await connect();
  const y = await Yacht.findOne({ kind, slug, published: true }).lean();
  return y ? (plain(y) as unknown as Y) : null;
}
export async function listArticles(limit = 6): Promise<A[]> {
  await connect();
  return plain(await Article.find({ published: true }).sort({ publishedAt: -1 }).limit(limit).lean()) as unknown as A[];
}
export async function getArticle(slug: string): Promise<A | null> {
  await connect();
  const a = await Article.findOne({ slug, published: true }).lean();
  return a ? (plain(a) as unknown as A) : null;
}
// Home page must still render when the database is not reachable (first run, preview builds).
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch (e) { console.error('[data]', e instanceof Error ? e.message : e); return fallback; }
}
