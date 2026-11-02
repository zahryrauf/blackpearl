import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { CREATABLE, RESOURCES, afterCreate, prepare } from '@/lib/admin';

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { resource } = await params;
  const M = RESOURCES[resource];
  if (!M || !(await getSession())) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await connect();
  return NextResponse.json({ items: await M.find().sort({ createdAt: -1 }).limit(500).lean() });
}

export async function POST(req: Request, { params }: Ctx) {
  const { resource } = await params;
  const M = RESOURCES[resource];
  if (!M || !CREATABLE.has(resource) || !(await getSession())) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await connect();
  try {
    const doc = await M.create(prepare(resource, await req.json()));
    await afterCreate(resource, doc.toObject());
    return NextResponse.json({ item: doc });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not save.' }, { status: 400 });
  }
}
