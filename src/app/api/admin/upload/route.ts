import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';

// Saves to public/uploads. On serverless hosts (Vercel) use S3, Cloudinary or Vercel Blob instead.
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const file = (await req.formData()).get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Upload a JPG, PNG, WebP or PDF.' }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'The file is larger than 12 MB.' }, { status: 400 });
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
