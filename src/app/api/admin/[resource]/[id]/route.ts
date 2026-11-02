import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RESOURCES, afterUpdate, prepare } from '@/lib/admin';

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { resource, id } = await params;
  const M = RESOURCES[resource];
  if (!M || !(await getSession())) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await connect();
  try {
    const before = await M.findById(id).lean();
    const after = await M.findByIdAndUpdate(id, { $set: prepare(resource, await req.json()) }, { new: true, runValidators: true }).lean();
    if (!after) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await afterUpdate(resource, before, after);
    return NextResponse.json({ item: after });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not save.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { resource, id } = await params;
  const M = RESOURCES[resource];
  const s = await getSession();
  if (!M || !s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (s.role !== 'admin') return NextResponse.json({ error: 'Only administrators can delete records.' }, { status: 403 });
  await connect();
  await M.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
