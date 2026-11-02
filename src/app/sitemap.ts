import type { MetadataRoute } from 'next';
import { connect } from '@/lib/db';
import { Article, Yacht } from '@/models';
import { siteUrl } from '@/lib/util';

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const out: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'weekly', priority: 1 }];
  try {
    await connect();
    const [ys, as] = await Promise.all([Yacht.find({ published: true }).select('kind slug updatedAt').lean(), Article.find({ published: true }).select('slug updatedAt').lean()]);
    for (const y of ys) out.push({ url: `${base}/${y.kind === 'sale' ? 'yachts' : 'charter'}/${y.slug}`, lastModified: y.updatedAt, priority: 0.8 });
    for (const a of as) out.push({ url: `${base}/journal/${a.slug}`, lastModified: a.updatedAt, priority: 0.5 });
  } catch {}
  return out;
}
