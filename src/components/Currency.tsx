'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { CURRENCIES, money, type Cur } from '@/lib/currency';

type Ctx = { cur: Cur; setCur: (c: Cur) => void; rates: Record<Cur, number> };
const base: Record<Cur, number> = { EUR: 1, USD: 1.08, GBP: 0.85, LKR: 330, AED: 3.97 };
const C = createContext<Ctx>({ cur: 'EUR', setCur: () => {}, rates: base });

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [cur, set] = useState<Cur>('EUR');
  const [rates, setRates] = useState(base);
  useEffect(() => {
    try { const s = localStorage.getItem('bp_cur') as Cur | null; if (s && CURRENCIES.includes(s)) set(s); } catch {}
    fetch('/api/currency').then((r) => r.json()).then((j) => j.rates && setRates(j.rates)).catch(() => {});
  }, []);
  const setCur = (c: Cur) => { set(c); try { localStorage.setItem('bp_cur', c); } catch {} };
  return <C.Provider value={{ cur, setCur, rates }}>{children}</C.Provider>;
}
export const useCurrency = () => useContext(C);
export function Price({ eur, compact = false }: { eur?: number | null; compact?: boolean }) {
  const { cur, rates } = useCurrency();
  if (eur == null) return <>Price on application</>;
  return <>{money(eur, cur, rates, compact)}</>;
}
export function CurrencySelect() {
  const { cur, setCur } = useCurrency();
  return (
    <select className="cursel" aria-label="Currency" value={cur} onChange={(e) => setCur(e.target.value as Cur)}>
      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
    </select>
  );
}
