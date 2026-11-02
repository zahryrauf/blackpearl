export type QuoteInput = { weeklyRateEUR: number; vatPct: number; apaPct: number; from: Date; to: Date };
export function nightsBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}
export function quote(i: QuoteInput) {
  const nights = nightsBetween(i.from, i.to);
  const charterFee = Math.round((i.weeklyRateEUR / 7) * nights);
  const vat = Math.round((charterFee * i.vatPct) / 100);
  const apa = Math.round((charterFee * i.apaPct) / 100); // advance provisioning allowance: fuel, food, port fees
  const total = charterFee + vat + apa;
  const depositPct = Number(process.env.DEPOSIT_PERCENT || 25);
  return { nights, charterFee, vat, apa, total, depositPct, deposit: Math.round((total * depositPct) / 100) };
}
