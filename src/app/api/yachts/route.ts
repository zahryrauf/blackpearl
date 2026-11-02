import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { Yacht } from '@/models';

// GET /api/yachts?kind=sale&minLength=30&maxLength=60&maxPrice=40000000&type=Motor yacht&region=Greek&q=text&sort=price|length|year
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const f: Record<string, unknown> = { published: true };
  if (u.get('kind')) f.kind = u.get('kind');
  const len: Record<string, number> = {};
  if (u.get('minLength')) len.$gte = Number(u.get('minLength'));
  if (u.get('maxLength')) len.$lt = Number(u.get('maxLength'));
  if (Object.keys(len).length) f.lengthM = len;
  if (u.get('maxPrice')) f.priceEUR = { $lte: Number(u.get('maxPrice')) };
  if (u.get('type')) f.type = u.get('type');
  if (u.get('region')) f.region = { $regex: String(u.get('region')).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (u.get('q')) f.$text = { $search: u.get('q') };
  const sorts: Record<string, Record<string, 1 | -1>> = { price: { priceEUR: 1 }, length: { lengthM: -1 }, year: { year: -1 } };
  await connect();
  const items = await Yacht.find(f).sort(sorts[u.get('sort') || ''] || { order: 1, createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ items });
}
