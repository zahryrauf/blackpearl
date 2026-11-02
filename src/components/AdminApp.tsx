'use client';
import { useCallback, useEffect, useState } from 'react';

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Field = { k: string; label: string; type?: 'text' | 'number' | 'select' | 'textarea' | 'bool' | 'images' | 'ranges'; options?: string[]; wide?: boolean };

const YACHT: Field[] = [
  { k: 'kind', label: 'Listing', type: 'select', options: ['sale', 'charter'] }, { k: 'name', label: 'Name' }, { k: 'slug', label: 'URL slug (auto if empty)' },
  { k: 'type', label: 'Type' }, { k: 'builder', label: 'Builder' }, { k: 'year', label: 'Year', type: 'number' },
  { k: 'lengthM', label: 'Length (m)', type: 'number' }, { k: 'beamM', label: 'Beam (m)', type: 'number' }, { k: 'draftM', label: 'Draft (m)', type: 'number' },
  { k: 'grossTonnage', label: 'Gross tonnage', type: 'number' }, { k: 'guests', label: 'Guests', type: 'number' }, { k: 'cabins', label: 'Cabins', type: 'number' }, { k: 'crew', label: 'Crew', type: 'number' },
  { k: 'region', label: 'Region' }, { k: 'season', label: 'Season' },
  { k: 'priceEUR', label: 'Asking price (EUR, sale)', type: 'number' }, { k: 'status', label: 'Sale status', type: 'select', options: ['available', 'under-offer', 'sold'] },
  { k: 'weeklyRateEUR', label: 'Weekly rate (EUR, charter)', type: 'number' }, { k: 'vatPct', label: 'VAT % (charter)', type: 'number' }, { k: 'apaPct', label: 'Expenses allowance %', type: 'number' },
  { k: 'palette', label: 'Drawn scene (when no photo)', type: 'select', options: ['twilight', 'mist', 'dawn', 'slate', 'sand', 'ink', 'lagoon', 'ceylon', 'isles', 'riviera'] },
  { k: 'order', label: 'Sort order', type: 'number' },
  { k: 'description', label: 'Description', type: 'textarea', wide: true }, { k: 'images', label: 'Photo URLs, one per line', type: 'images', wide: true },
  { k: 'brochureUrl', label: 'Brochure PDF URL' }, { k: 'blocked', label: 'Unavailable dates: "2026-12-01 2026-12-08 note", one per line', type: 'ranges', wide: true },
  { k: 'featured', label: 'Featured on home page', type: 'bool' }, { k: 'published', label: 'Published', type: 'bool' },
];
const ARTICLE: Field[] = [
  { k: 'title', label: 'Title' }, { k: 'slug', label: 'URL slug (auto if empty)' }, { k: 'category', label: 'Category' },
  { k: 'excerpt', label: 'Excerpt', type: 'textarea', wide: true }, { k: 'body', label: 'Body (blank line between paragraphs)', type: 'textarea', wide: true }, { k: 'published', label: 'Published', type: 'bool' },
];
const TABS = ['enquiries', 'bookings', 'yachts', 'articles', 'subscribers'] as const;
const LABEL: Record<string, string> = { enquiries: 'Enquiries', bookings: 'Charter requests', yachts: 'Yachts', articles: 'Journal', subscribers: 'Subscribers' };
const day = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function AdminApp({ email, role }: { email: string; role: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('enquiries');
  const [rows, setRows] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/${tab}`);
    if (r.status === 401) { window.location.href = '/admin/login'; return; }
    setRows((await r.json()).items || []);
  }, [tab]);
  useEffect(() => { setEdit(null); setMsg(''); load(); }, [tab, load]);

  async function patch(id: string, body: Row) {
    const r = await fetch(`/api/admin/${tab}/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json(); setMsg(r.ok ? 'Saved.' : j.error); load();
  }
  async function del(id: string) {
    if (!confirm('Delete this record?')) return;
    const r = await fetch(`/api/admin/${tab}/${id}`, { method: 'DELETE' });
    setMsg(r.ok ? 'Deleted.' : (await r.json()).error); load();
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    const body = { ...edit };
    if (tab === 'yachts') {
      if (typeof body.blocked === 'string') body.blocked = body.blocked.split('\n').map((l: string) => l.trim()).filter(Boolean).map((l: string) => { const [from, to, ...n] = l.split(/\s+/); return { from, to, note: n.join(' ') }; });
    }
    const r = await fetch(edit._id ? `/api/admin/${tab}/${edit._id}` : `/api/admin/${tab}`, { method: edit._id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (r.ok) { setEdit(null); setMsg('Saved.'); load(); } else setMsg(j.error);
  }
  async function upload(file: File) {
    const fd = new FormData(); fd.set('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const j = await r.json();
    if (!r.ok) return setMsg(j.error);
    const cur = Array.isArray(edit?.images) ? edit!.images.join('\n') : edit?.images || '';
    setEdit({ ...edit!, images: (cur ? cur + '\n' : '') + j.url });
  }
  const fields = tab === 'yachts' ? YACHT : ARTICLE;
  const val = (f: Field) => {
    const v = edit?.[f.k];
    if (f.type === 'images') return Array.isArray(v) ? v.join('\n') : v || '';
    if (f.type === 'ranges') return typeof v === 'string' ? v : (v || []).map((b: Row) => `${day(b.from)} ${day(b.to)} ${b.note || ''}`.trim()).join('\n');
    return v ?? '';
  };

  return (
    <div className="admin">
      <div className="ahead">
        <div><div className="eyebrow">Signed in as {email} · {role}</div><h1>Dashboard</h1></div>
        <button className="link" style={{ background: 'none', border: 0, borderBottom: '1px solid currentColor', color: 'inherit', cursor: 'pointer' }} onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin/login'; }}>Sign out</button>
      </div>
      <div className="tabs" role="tablist">{TABS.map((t) => <button key={t} className="tab" role="tab" aria-pressed={tab === t} onClick={() => setTab(t)}>{LABEL[t]}</button>)}</div>
      {msg && <p className="thanks" role="status">{msg}</p>}

      {(tab === 'yachts' || tab === 'articles') && !edit && (
        <p><button className="send" onClick={() => setEdit(tab === 'yachts' ? { kind: 'sale', type: 'Motor yacht', palette: 'mist', published: true, status: 'available', sceneX: 0.08, sceneW: 0.84 } : { category: 'Journal', published: true })}>Add {tab === 'yachts' ? 'yacht' : 'article'}</button></p>
      )}

      {edit && (tab === 'yachts' || tab === 'articles') && (
        <form className="aform" onSubmit={save}>
          {fields.map((f) => (
            <label key={f.k} className={`fld${f.wide ? ' wide' : ''}`} htmlFor={`f-${f.k}`}>
              {f.label}
              {f.type === 'select' ? <select id={`f-${f.k}`} value={val(f)} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                : f.type === 'bool' ? <input id={`f-${f.k}`} type="checkbox" checked={!!edit[f.k]} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.checked })} />
                : f.type === 'textarea' || f.type === 'images' || f.type === 'ranges' ? <textarea id={`f-${f.k}`} rows={f.type === 'textarea' ? 6 : 4} value={val(f)} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })} />
                : <input id={`f-${f.k}`} type={f.type === 'number' ? 'number' : 'text'} step="any" value={val(f)} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })} />}
              {f.type === 'images' && <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload photo" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />}
            </label>
          ))}
          <div className="wide"><button className="send" type="submit">Save</button> <button className="link" type="button" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', marginLeft: 20 }} onClick={() => setEdit(null)}>Cancel</button></div>
        </form>
      )}

      {!edit && (
        <div className="tablewrap"><table className="atable">
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                {tab === 'enquiries' && <>
                  <td><b>{r.name}</b><br /><a href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <><br />{r.phone}</>}</td>
                  <td>{r.topic}{r.yachtSlug ? ` · ${r.yachtSlug}` : ''}<br /><span className="mut">{r.message}</span></td>
                  <td><select aria-label="Status" value={r.status} onChange={(e) => patch(r._id, { status: e.target.value })}>{['new', 'contacted', 'viewing', 'offer', 'won', 'lost'].map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td><input aria-label="Assigned broker" placeholder="Broker" defaultValue={r.assignedTo} onBlur={(e) => e.target.value !== (r.assignedTo || '') && patch(r._id, { assignedTo: e.target.value })} /></td>
                  <td><textarea aria-label="Notes" placeholder="Notes" defaultValue={r.notes} onBlur={(e) => e.target.value !== (r.notes || '') && patch(r._id, { notes: e.target.value })} /></td>
                </>}
                {tab === 'bookings' && <>
                  <td><b>{r.yachtName}</b><br />{day(r.from)} to {day(r.to)}</td>
                  <td>{r.name}<br /><a href={`mailto:${r.email}`}>{r.email}</a>{r.guests ? <><br />{r.guests} guests</> : null}</td>
                  <td className="num">Total EUR {r.totalEUR?.toLocaleString('en-GB')}<br />Deposit EUR {r.depositEUR?.toLocaleString('en-GB')}</td>
                  <td><select aria-label="Status" value={r.status} onChange={(e) => patch(r._id, { status: e.target.value })}>{['requested', 'confirmed', 'deposit-paid', 'declined', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td className="mut">{r.message}</td>
                </>}
                {tab === 'yachts' && <>
                  <td><b>{r.name}</b><br /><span className="mut">{r.slug}</span></td>
                  <td>{r.kind} · {r.lengthM} m</td>
                  <td className="num">{r.kind === 'sale' ? `EUR ${r.priceEUR?.toLocaleString('en-GB') ?? ''}` : `EUR ${r.weeklyRateEUR?.toLocaleString('en-GB') ?? ''} / week`}</td>
                  <td>{r.published ? 'Published' : 'Draft'}</td>
                  <td><button className="link" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }} onClick={() => setEdit({ ...r })}>Edit</button></td>
                </>}
                {tab === 'articles' && <>
                  <td><b>{r.title}</b><br /><span className="mut">{r.slug}</span></td><td>{r.category}</td><td>{day(r.publishedAt)}</td><td>{r.published ? 'Published' : 'Draft'}</td>
                  <td><button className="link" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }} onClick={() => setEdit({ ...r })}>Edit</button></td>
                </>}
                {tab === 'subscribers' && <><td>{r.email}</td><td>{day(r.createdAt)}</td><td>{r.active ? 'Active' : 'Unsubscribed'}</td><td /><td /></>}
                <td>{role === 'admin' && <button className="link" style={{ background: 'none', border: 0, color: 'crimson', cursor: 'pointer' }} onClick={() => del(r._id)}>Delete</button>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="mut">Nothing here yet.</td></tr>}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
