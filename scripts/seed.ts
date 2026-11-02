import bcrypt from 'bcryptjs';
import { connect } from '../src/lib/db';
import { Article, User, Yacht } from '../src/models';

const sale = [
  { name: 'Sagittarii', type: 'Explorer yacht', builder: 'Nordhavn Yards', year: 2021, lengthM: 57, beamM: 10.2, draftM: 3.1, grossTonnage: 890, guests: 12, cabins: 6, crew: 14, region: 'Colombo', priceEUR: 38_000_000, palette: 'slate', sceneX: 0.07, sceneW: 0.86, featured: true, description: 'A long-range explorer with a fumed oak saloon, a beach club and a 6,000 nautical mile range.' },
  { name: 'Arcturus', type: 'Motor yacht', builder: 'Alder Marine', year: 2019, lengthM: 34.2, beamM: 7.6, draftM: 1.9, grossTonnage: 248, guests: 8, cabins: 4, crew: 6, region: 'Antibes', priceEUR: 9_400_000, palette: 'dawn', sceneX: 0.1, sceneW: 0.8, description: 'A quiet, well-proportioned yacht with an owner’s deck suite and a generous aft terrace.' },
  { name: 'Pearl Diver', type: 'Motor yacht', builder: 'Alder Marine', year: 2016, lengthM: 48.6, beamM: 9.4, draftM: 2.7, grossTonnage: 620, guests: 10, cabins: 5, crew: 11, region: 'Athens', priceEUR: 21_500_000, palette: 'ink', sceneX: 0.08, sceneW: 0.84, description: 'Refitted in 2023 with new engines, stabilisers and a redesigned sky lounge.' },
  { name: 'Lagoon Sun', type: 'Motor yacht', builder: 'Kestrel', year: 2022, lengthM: 27.5, beamM: 6.8, draftM: 1.6, grossTonnage: 164, guests: 8, cabins: 4, crew: 4, region: 'Maldives', priceEUR: 6_200_000, palette: 'mist', sceneX: 0.14, sceneW: 0.72, description: 'Shallow draft and a large flybridge, built for island cruising.' },
  { name: 'Meridian Nine', type: 'Superyacht', builder: 'Harland & Voss', year: 2020, lengthM: 81, beamM: 13.4, draftM: 4, grossTonnage: 2480, guests: 14, cabins: 7, crew: 24, region: 'Antibes', priceEUR: 112_000_000, palette: 'sand', sceneX: 0.05, sceneW: 0.9, description: 'Eighty-one metres of calm: a spa, a cinema and a tender garage for two 9-metre launches.' },
  { name: 'Halcyon', type: 'Motor yacht', builder: 'Harland & Voss', year: 2014, lengthM: 62.4, beamM: 11, draftM: 3.6, grossTonnage: 1120, guests: 12, cabins: 6, crew: 16, region: 'Athens', priceEUR: 46_000_000, palette: 'riviera', sceneX: 0.07, sceneW: 0.86, description: 'Classic lines, a full-beam owner’s suite and a very low hours engine record.' },
].map((y, i) => ({ ...y, kind: 'sale', slug: y.name.toLowerCase().replace(/\s+/g, '-'), order: i }));

const charter = [
  { name: 'Kalu Mudu', lengthM: 38, guests: 10, cabins: 5, crew: 8, region: 'Maldives', season: 'Dec – Apr', weeklyRateEUR: 118_000, vatPct: 0, palette: 'lagoon' },
  { name: 'Oyster Bay', lengthM: 46.5, guests: 12, cabins: 6, crew: 10, region: 'Western Mediterranean', season: 'Jun – Sep', weeklyRateEUR: 182_000, vatPct: 10, palette: 'riviera' },
  { name: 'Mannar', lengthM: 52.2, guests: 12, cabins: 6, crew: 12, region: 'Sri Lanka and the Andamans', season: 'Dec – Mar', weeklyRateEUR: 246_000, vatPct: 0, palette: 'ceylon' },
  { name: 'Vega Noir', lengthM: 64, guests: 14, cabins: 7, crew: 16, region: 'Greek Isles', season: 'May – Sep', weeklyRateEUR: 395_000, vatPct: 12, palette: 'isles' },
].map((y, i) => ({ ...y, kind: 'charter', type: 'Motor yacht', slug: y.name.toLowerCase().replace(/\s+/g, '-'), apaPct: 30, sceneX: 0.06, sceneW: 0.88, order: i, description: `${y.name} is crewed by ${y.crew} and cruises ${y.region} in ${y.season}.` }));

const articles = [
  { title: 'Pre-owned yachts under 50 metres now sell in under five months', category: 'Market note', excerpt: 'Buyers want a vessel they can use next season, so surveys are being booked before offers are final.', body: 'Buyers want a vessel they can use next season.\n\nSurveys are now booked before offers are final, which has shortened the average time to sale.' },
  { title: 'Mannar joins the Indian Ocean season', category: 'Fleet', excerpt: 'A 52-metre addition, based between Colombo and Port Blair from December.', body: 'Mannar is a 52-metre yacht that will cruise Sri Lanka and the Andamans from December.\n\nHer crew of twelve has worked together for six seasons.' },
  { title: 'What a pre-purchase survey covers', category: 'Guide', excerpt: 'Hull, machinery, electrics and class records, in the order they are checked.', body: 'A survey begins with the hull and the class records.\n\nMachinery, electrics and interiors follow, each with its own report.' },
].map((a) => ({ ...a, slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) }));

async function main() {
  const conn = await connect();
  const email = (process.env.ADMIN_EMAIL || 'admin@blackpearl.example').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-this-password';
  await User.updateOne({ email }, { $set: { passwordHash: await bcrypt.hash(password, 12), role: 'admin', name: 'Administrator' } }, { upsert: true });
  console.log(`Admin ready: ${email}`);
  if (process.argv.includes('--no-sample')) return conn.disconnect();
  for (const y of [...sale, ...charter]) await Yacht.updateOne({ slug: y.slug }, { $setOnInsert: y }, { upsert: true });
  for (const a of articles) await Article.updateOne({ slug: a.slug }, { $setOnInsert: a }, { upsert: true });
  console.log(`Sample data: ${sale.length + charter.length} yachts, ${articles.length} articles (existing records are left untouched)`);
  await conn.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
