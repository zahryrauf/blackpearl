export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');
export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const plain = <T,>(d: T): T => JSON.parse(JSON.stringify(d));
export function overlaps(aFrom: Date, aTo: Date, bFrom: Date, bTo: Date) {
  return aFrom < bTo && bFrom < aTo;
}
