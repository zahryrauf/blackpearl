import nodemailer, { type Transporter } from 'nodemailer';

let tx: Transporter | null = null;
function transport() {
  if (tx || !process.env.SMTP_HOST) return tx;
  tx = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return tx;
}
const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const html = (title: string, rows: [string, string | undefined][], foot = '') =>
  `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#15191B"><h2 style="font-weight:400;letter-spacing:.02em">${esc(title)}</h2>` +
  rows.filter(([, v]) => v).map(([k, v]) => `<p style="margin:6px 0"><span style="font:11px sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#767B7B">${esc(k)}</span><br>${esc(v)}</p>`).join('') +
  (foot ? `<p style="margin-top:24px;color:#767B7B;font-size:13px">${foot}</p>` : '') + '</div>';

export async function sendMail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const t = transport();
  const from = process.env.MAIL_FROM || 'Blackpearl Yachts <no-reply@localhost>';
  if (!t) { console.log(`[mail:dev] to=${opts.to} subject="${opts.subject}"`); return; }
  try { await t.sendMail({ from, ...opts }); } catch (e) { console.error('[mail] failed', e); }
}
export const inbox = (topic?: string) =>
  (topic === 'charter' && process.env.CHARTER_EMAIL) || ((topic === 'buy' || topic === 'sell') && process.env.SALES_EMAIL) || process.env.INBOX_EMAIL || 'hello@localhost';

export async function pushLead(payload: unknown) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `New lead: ${JSON.stringify(payload)}`, ...(payload as object) }) });
  } catch (e) { console.error('[webhook] failed', e); }
}
