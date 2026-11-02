import { redirect } from 'next/navigation';
import AdminApp from '@/components/AdminApp';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

export default async function Admin() {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return <main className="wrap detail"><AdminApp email={s.email} role={s.role} /></main>;
}
