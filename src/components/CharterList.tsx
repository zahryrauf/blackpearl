'use client';
import Link from 'next/link';
import { useState } from 'react';
import Media from './Media';
import { Price } from './Currency';
import type { Y } from '@/lib/data';

export default function CharterList({ items }: { items: Y[] }) {
  const [i, setI] = useState(Math.min(2, Math.max(0, items.length - 1)));
  const cur = items[i];
  return (
    <div className="split">
      <div className="side">
        <div className="eyebrow rl">Charter</div>
        <h2>Crewed, by the week</h2>
        <p className="d">Weekly rates include the yacht and crew. Fuel, provisions, port fees and VAT are charged separately.</p>
        {cur && (
          <>
            <div className="frame"><div className="pic"><Media key={cur._id} y={cur} /></div></div>
            <p className="cap">{cur.name} · {cur.lengthM.toFixed(1)} m</p>
          </>
        )}
      </div>
      <div>
        <div className="list">
          {items.map((y, n) => (
            <Link key={y._id} className="lrow" href={`/charter/${y.slug}`} onMouseEnter={() => setI(n)} onFocus={() => setI(n)}>
              <div>
                <h3>{y.name}</h3>
                <div className="c num">{[y.region, y.season, `${y.lengthM.toFixed(1)} m`, y.guests ? `${y.guests} guests` : ''].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="p num pr"><div className="c">From, per week</div><Price eur={y.weeklyRateEUR} /></div>
              <span className="ar" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p className="note">The charter fleet is being updated. Enquire for current availability.</p>}
      </div>
    </div>
  );
}
