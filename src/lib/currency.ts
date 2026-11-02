export const CURRENCIES = ['EUR', 'USD', 'GBP', 'LKR', 'AED'] as const;
export type Cur = (typeof CURRENCIES)[number];
const FALLBACK: Record<Cur, number> = { EUR: 1, USD: 1.08, GBP: 0.85, LKR: 330, AED: 3.97 };
let cached: { at: number; rates: Record<Cur, number> } | null = null;

export async function getRates() {
  if (cached && Date.now() - cached.at < 12 * 3600_000) return cached.rates;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/EUR', { next: { revalidate: 43200 } });
    const j = await r.json();
    const rates = { ...FALLBACK };
    for (const c of CURRENCIES) if (typeof j?.rates?.[c] === 'number') rates[c] = j.rates[c];
    cached = { at: Date.now(), rates };
  } catch {
    cached = { at: Date.now() - 11 * 3600_000, rates: FALLBACK };
  }
  return cached.rates;
}
export function money(eur: number, cur: Cur, rates: Record<Cur, number>, compact = false) {
  const v = eur * (rates[cur] ?? 1);
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 0,
    notation: compact && v >= 1e6 ? 'compact' : 'standard',
    ...(compact && v >= 1e6 ? { maximumFractionDigits: 1 } : {}),
  }).format(v);
  return compact && v >= 1e6 ? formatted.replace(/\.0(?=[A-Za-z])/g, '') : formatted;
}
