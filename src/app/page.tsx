import Link from 'next/link';
import Media from '@/components/Media';
import SceneCanvas from '@/components/SceneCanvas';
import Listings from '@/components/Listings';
import CharterList from '@/components/CharterList';
import EnquiryForm from '@/components/EnquiryForm';
import { Price } from '@/components/Currency';
import { DESTINATIONS, SERVICES } from '@/lib/content';
import { listArticles, listYachts, safe } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [sale, charter, articles] = await Promise.all([safe(listYachts('sale'), []), safe(listYachts('charter'), []), safe(listArticles(3), [])]);
  const feat = sale.find((y) => y.featured) || sale[0];
  const mist = sale[3] || sale[0];
  return (
    <>
      <div id="top" className="hero">
        <div className="hl">
          <div>
            <div className="eyebrow rl rise">Yacht brokerage and charter</div>
            <h1 className="rise d">Quietly <em>extraordinary</em></h1>
            <p className="sub rise d">Superyachts of 24 to 90 metres, found, refitted and chartered with complete discretion since 1994.</p>
            <Link className="link rise d" href="/#sale">View yachts for sale</Link>
          </div>
          <div className="foot"><span>Colombo</span><span>Antibes</span><span>Athens</span></div>
        </div>
        <div className="hr">
          {feat?.images?.[0]
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={feat.images[0]} alt={feat.name} />
            : <SceneCanvas palette="twilight" animate yacht={{ L: 0.46, x: 0.38, dy: 0.075 }} label="A white motor yacht at anchor on calm water at twilight" />}
          <span className="vlabel">Indian Ocean · 6.93° N 79.84° E</span>
          {feat && (
            <aside className="over" aria-label="Featured yacht">
              <div className="eyebrow">Featured</div>
              <h3>{feat.name}</h3>
              <div className="row num"><span>{feat.lengthM.toFixed(1)} m · {feat.type}</span><span>{feat.year}</span></div>
              <Link className="link" href={`/yachts/${feat.slug}`}>View particulars</Link>
            </aside>
          )}
        </div>
      </div>

      <main>
        <section className="sec wrap" id="house">
          <div className="hgrid">
            <div className="frame">
              <div className="pic">{mist && <Media y={{ ...mist, palette: mist.images?.length ? mist.palette : 'mist' }} index={1} />}</div>
              {mist && <span className="cap eyebrow">{mist.name} · {mist.lengthM.toFixed(1)} m</span>}
            </div>
            <div className="txt">
              <div className="eyebrow rl">The house</div>
              <p className="big">We represent a small number of exceptional vessels, each chosen for the care with which it was made, and introduce them to the people who will <em>appreciate that care.</em></p>
              <div className="facts">
                <div><b className="num">186</b><span>Yachts sold</span></div>
                <div><b className="num">24–90 m</b><span>Length range</span></div>
                <div><b className="num">7</b><span>Offices</span></div>
              </div>
              <Link className="link" href="/#services">Our approach</Link>
            </div>
          </div>
        </section>

        <section className="sec wrap" id="sale">
          <div className="sh">
            <div><div className="eyebrow rl">Yachts for sale</div><h2>Current listings</h2></div>
            <p>Lengths in metres, tonnage in gross tonnes. Asking prices, excluding VAT where applicable. Choose a currency in the header.</p>
          </div>
          <Listings items={sale} />
        </section>

        <div className="band">
          <div className="pic"><SceneCanvas palette="ink" yacht={{ L: 0.34, x: 0.5, dy: 0.1 }} seed={6} label="A yacht with lit windows under a night sky" /></div>
          <div className="wrap"><div className="card2">
            <div className="eyebrow rl">Our standard</div>
            <h3>Every vessel is surveyed twice. Once by class, once by us.</h3>
            <p>Our brokers inspect hull, machinery and interiors in person before a yacht is listed, and again before any sale completes.</p>
            <Link className="link" href="/#contact">Speak to a broker</Link>
          </div></div>
        </div>

        <section className="sec wrap" id="charter"><CharterList items={charter} /></section>

        <section className="sec wrap" id="services">
          <div className="svcwrap">
            <div><div className="eyebrow rl">Services</div><h2>Beyond the sale</h2></div>
            <div className="svc">{SERVICES.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
          </div>
        </section>

        <section className="sec wrap" id="destinations">
          <div className="sh">
            <div><div className="eyebrow rl">Destinations</div><h2>Where the fleet goes</h2></div>
            <p>Four cruising grounds, each timed to its season.</p>
          </div>
          <div className="dests">
            {DESTINATIONS.map((d) => (
              <article key={d.n}>
                <div className="pic"><SceneCanvas palette={d.k} yacht={null} seed={d.seed} label={`${d.n} at dusk`} /></div>
                <div className="eyebrow" style={{ marginTop: 22 }}>{d.s}</div><h3>{d.n}</h3><p>{d.t}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sec wrap" id="journal">
          <div className="sh"><div><div className="eyebrow rl">Journal</div><h2>From the desk</h2></div></div>
          <div className="journal">
            {articles.map((a, i) => (
              <article key={a._id} className={i === 0 ? 'lead' : ''}>
                <span className="eyebrow">{a.category} · {new Date(a.publishedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <h3>{a.title}</h3><p>{a.excerpt}</p>
                <Link className="link" href={`/journal/${a.slug}`}>Read</Link>
              </article>
            ))}
            {articles.length === 0 && <p className="note">No articles yet.</p>}
          </div>
        </section>

        <section className="sec wrap" id="contact">
          <div className="contact">
            <div>
              <div className="eyebrow rl">Contact</div>
              <h2>Begin a conversation</h2>
              <p>A broker replies within one working day. Buying, selling and chartering are handled by separate teams.</p>
              <ul className="offices"><li>Colombo<span>Indian Ocean</span></li><li>Antibes<span>Mediterranean</span></li><li>Athens<span>Greece and Ionian</span></li></ul>
            </div>
            <div className="formbox"><EnquiryForm topic="buy" /></div>
          </div>
        </section>
      </main>
    </>
  );
}
