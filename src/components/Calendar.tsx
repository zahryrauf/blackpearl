'use client';
type Range = { from: string; to: string };
const d0 = (s: string | Date) => { const d = new Date(s); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };

export default function Calendar({ booked, months = 6 }: { booked: Range[]; months?: number }) {
  const now = new Date();
  const out = [];
  for (let m = 0; m < months; m++) {
    const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + m, 1));
    const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(<span key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const t = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d);
      const busy = booked.some((b) => t >= d0(b.from) && t < d0(b.to));
      cells.push(<span key={d} className={busy ? 'busy' : ''} title={busy ? 'Booked' : 'Available'}>{d}</span>);
    }
    out.push(
      <div key={m} className="month">
        <div className="eyebrow">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</div>
        <div className="days">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, i) => <i key={i}>{x}</i>)}{cells}</div>
      </div>,
    );
  }
  return <div className="cal" aria-label="Availability calendar">{out}<p className="note" style={{ gridColumn: '1/-1', marginTop: 0 }}>Struck-through days are booked or unavailable.</p></div>;
}
