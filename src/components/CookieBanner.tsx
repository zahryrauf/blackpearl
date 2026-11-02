'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA = process.env.NEXT_PUBLIC_GA_ID;
export default function CookieBanner() {
  const [choice, setChoice] = useState<string | null>('pending');
  useEffect(() => { try { setChoice(localStorage.getItem('bp_consent')); } catch { setChoice(null); } }, []);
  const set = (v: string) => { try { localStorage.setItem('bp_consent', v); } catch {} setChoice(v); };
  return (
    <>
      {GA && choice === 'yes' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {GA && choice === null && (
        <div className="consent" role="dialog" aria-label="Cookie consent">
          <p>We use analytics cookies to see which yachts interest visitors. You can decline.</p>
          <div><button className="link" type="button" onClick={() => set('yes')}>Accept</button><button className="link" type="button" onClick={() => set('no')}>Decline</button></div>
        </div>
      )}
    </>
  );
}
