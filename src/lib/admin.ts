import { Article, Booking, Enquiry, Subscriber, Yacht } from '@/models';
import { slugify, siteUrl } from '@/lib/util';
import { html, sendMail } from '@/lib/mail';
import type { Model } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RESOURCES: Record<string, Model<any>> = { yachts: Yacht, articles: Article, enquiries: Enquiry, bookings: Booking, subscribers: Subscriber };
export const CREATABLE = new Set(['yachts', 'articles']);

export function prepare(resource: string, body: Record<string, unknown>) {
  const b = { ...body };
  delete b._id; delete b.createdAt; delete b.updatedAt; delete b.__v;
  if (resource === 'yachts') {
    if (!b.slug && b.name) b.slug = slugify(String(b.name));
    for (const k of ['year', 'lengthM', 'beamM', 'draftM', 'grossTonnage', 'guests', 'cabins', 'crew', 'priceEUR', 'weeklyRateEUR', 'vatPct', 'apaPct', 'sceneX', 'sceneW', 'order'])
      if (k in b) b[k] = b[k] === '' || b[k] === null ? undefined : Number(b[k]);
    if (typeof b.images === 'string') b.images = (b.images as string).split('\n').map((s) => s.trim()).filter(Boolean);
  }
  if (resource === 'articles' && !b.slug && b.title) b.slug = slugify(String(b.title));
  return b;
}

export async function afterCreate(resource: string, doc: Record<string, any>) {
  if (resource !== 'yachts' || !doc.published || doc.kind !== 'sale' || doc.status !== 'available') return;
  const subs = await Subscriber.find({ active: true }).select('email').lean();
  const link = `${siteUrl()}/yachts/${doc.slug}`;
  for (const s of subs) {
    await sendMail({ to: s.email, subject: `New listing: ${doc.name}`, html: html('New listing', [['Yacht', doc.name], ['Length', `${doc.lengthM} m`], ['Asking', doc.priceEUR ? `EUR ${Number(doc.priceEUR).toLocaleString('en-GB')}` : undefined], ['View', link]]) });
  }
}

export async function afterUpdate(resource: string, before: Record<string, any> | null, after: Record<string, any> | null) {
  if (resource !== 'bookings' || !before || !after || before.status === after.status) return;
  if (after.status === 'confirmed') {
    const link = `${siteUrl()}/pay/${after._id}?token=${after.payToken}`;
    await sendMail({ to: after.email, subject: `Your charter of ${after.yachtName} is confirmed`, html: html('Dates confirmed', [['Yacht', after.yachtName], ['Deposit', `EUR ${Number(after.depositEUR).toLocaleString('en-GB')}`], ['Pay your deposit', link]], 'Your dates are held once the deposit is received.') });
  } else if (after.status === 'declined') {
    await sendMail({ to: after.email, subject: `About your request for ${after.yachtName}`, html: html('We cannot offer these dates', [['Yacht', after.yachtName]], 'Please reply and we will suggest alternatives.') });
  }
}
