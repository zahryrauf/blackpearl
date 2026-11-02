import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Media from '@/components/Media';
import BookingPanel from '@/components/BookingPanel';
import { Price } from '@/components/Currency';
import { getYacht } from '@/lib/data';
import { siteUrl } from '@/lib/util';

export const dynamic = 'force-dynamic';
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const y = await getYacht('charter', (await params).slug).catch(() => null);
  return y ? { title: `Charter ${y.name}`, description: y.description?.slice(0, 160) } : {};
}

export default async function CharterPage({ params }: P) {
  const y = await getYacht('charter', (await params).slug).catch(() => null);
  if (!y) notFound();
  const specs: [string, string | undefined][] = [
    ['Length', `${y.lengthM.toFixed(1)} m`], ['Guests', y.guests ? String(y.guests) : undefined], ['Cabins', y.cabins ? String(y.cabins) : undefined], ['Crew', y.crew ? String(y.crew) : undefined],
    ['Based', y.region], ['Season', y.season], ['Builder', y.builder], ['Year', y.year ? String(y.year) : undefined],
  ];
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: `Charter ${y.name}`, description: y.description, url: `${siteUrl()}/charter/${y.slug}`, ...(y.weeklyRateEUR ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: y.weeklyRateEUR } } : {}) };
  return (
    <main className="wrap detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="eyebrow rl">Charter · {y.region}</div>
      <div className="dhead"><h1>{y.name}</h1><div className="dprice num"><span className="eyebrow">From, per week</span><b><Price eur={y.weeklyRateEUR} /></b></div></div>
      <div className="gallery">
        {y.images && y.images.length > 1 ? y.images.map((_, i) => <div key={i} className={`pic${i === 0 ? ' big' : ''}`}><Media y={y} index={i} /></div>) : <div className="pic big"><Media y={y} /></div>}
      </div>
      <div className="dsplit">
        <div>
          {y.description && <p className="big">{y.description}</p>}
          <dl className="specs2 num">{specs.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
        <div className="formbox" id="book">
          <div className="eyebrow rl" style={{ marginBottom: 28 }}>Availability and cost</div>
          <BookingPanel slug={y.slug} maxGuests={y.guests} />
        </div>
      </div>
    </main>
  );
}
