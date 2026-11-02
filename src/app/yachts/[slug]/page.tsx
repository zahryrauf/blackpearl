import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Media from '@/components/Media';
import EnquiryForm from '@/components/EnquiryForm';
import { Price } from '@/components/Currency';
import { getYacht } from '@/lib/data';
import { siteUrl } from '@/lib/util';

export const dynamic = 'force-dynamic';
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const y = await getYacht('sale', (await params).slug).catch(() => null);
  return y ? { title: `${y.name}, ${y.lengthM.toFixed(0)} m ${y.type}`, description: y.description?.slice(0, 160), openGraph: { images: y.images?.[0] ? [y.images[0]] : [] } } : {};
}

export default async function YachtPage({ params }: P) {
  const y = await getYacht('sale', (await params).slug).catch(() => null);
  if (!y) notFound();
  const specs: [string, string | undefined][] = [
    ['Length', `${y.lengthM.toFixed(1)} m`], ['Beam', y.beamM ? `${y.beamM.toFixed(1)} m` : undefined], ['Draft', y.draftM ? `${y.draftM.toFixed(1)} m` : undefined],
    ['Gross tonnage', y.grossTonnage?.toLocaleString('en-GB')], ['Builder', y.builder], ['Year', y.year ? String(y.year) : undefined],
    ['Guests', y.guests ? String(y.guests) : undefined], ['Cabins', y.cabins ? String(y.cabins) : undefined], ['Crew', y.crew ? String(y.crew) : undefined], ['Lying', y.region],
  ];
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: y.name, description: y.description, image: y.images, url: `${siteUrl()}/yachts/${y.slug}`, ...(y.priceEUR ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: y.priceEUR, availability: y.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } } : {}) };
  return (
    <main className="wrap detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="eyebrow rl">Yachts for sale · {y.type}</div>
      <div className="dhead"><h1>{y.name}</h1><div className="dprice num"><span className="eyebrow">{y.status && y.status !== 'available' ? y.status.replace('-', ' ') : 'Asking price'}</span><b><Price eur={y.priceEUR} /></b></div></div>
      <div className="gallery">
        {y.images && y.images.length > 1
          ? y.images.map((_, i) => <div key={i} className={`pic${i === 0 ? ' big' : ''}`}><Media y={y} index={i} /></div>)
          : <div className="pic big"><Media y={y} /></div>}
      </div>
      <div className="dsplit">
        <div>
          {y.description && <p className="big">{y.description}</p>}
          <dl className="specs2 num">{specs.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
        <div className="formbox" id="enquire">
          <div className="eyebrow rl" style={{ marginBottom: 28 }}>Request particulars</div>
          <EnquiryForm topic="buy" yachtSlug={y.slug} compact />
        </div>
      </div>
    </main>
  );
}
