import { NextResponse } from 'next/server';
// Placeholder for first-party analytics. Wire to your own store if you do not want Google Analytics.
export async function POST() {
  return new NextResponse(null, { status: 204 });
}
