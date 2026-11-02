'use client';
import Link from 'next/link';
import { useState } from 'react';
import Media from './Media';
import { Price } from './Currency';
import { lengthBand } from '@/lib/content';
import type { Y } from '@/lib/data';

const TABS = [['all', 'All'], ['s', 'Under 40 m'], ['m', '40 – 60 m'], ['l', 'Over 60 m']];

export default function Listings({ items }: { items: Y[] }) {
  const [f, setF] = useState('all');
  const shown = items.filter((y) => f === 'all' || lengthBand(y.lengthM) === f);
  return (
    <>
      <div className="tabs" role="group" aria-label="Filter by length">
        {TABS.map(([k, label]) => <button key={k} className="tab" type="button" aria-pressed={f === k} onClick={() => setF(k)}>{label}</button>)}
      </div>
      {shown.length === 0 && <p className="note">No yachts match this length right now. Ask a broker about off-market vessels.</p>}
      <div className="grid">
        {shown.map((y, i) => (
          <Link key={y._id} href={`/yachts/${y.slug}`} className={`card p${i % 5}`}>
            <div className="pic"><Media y={y} /></div>
            <div className="eyebrow">{y.type}{y.year ? ` · ${y.year}` : ''}{y.status && y.status !== 'available' ? ` · ${y.status.replace('-', ' ')}` : ''}</div>
            <h3>{y.name}</h3>
            <div className="row">
              <span className="num">{y.lengthM.toFixed(1)} m{y.beamM ? ` · ${y.beamM.toFixed(1)} m beam` : ''}{y.grossTonnage ? ` · ${y.grossTonnage.toLocaleString('en-GB')} GT` : ''}</span>
              <b className="num"><Price eur={y.priceEUR} compact /></b>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
