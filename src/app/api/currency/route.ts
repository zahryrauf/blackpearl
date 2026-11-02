import { NextResponse } from 'next/server';
import { getRates } from '@/lib/currency';
export async function GET() {
  return NextResponse.json({ base: 'EUR', rates: await getRates() }, { headers: { 'cache-control': 'public, max-age=3600' } });
}
