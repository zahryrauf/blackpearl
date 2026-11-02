import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import NewsletterForm from '@/components/NewsletterForm';
import CookieBanner from '@/components/CookieBanner';
import { CurrencyProvider } from '@/components/Currency';
import { siteUrl } from '@/lib/util';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Blackpearl Yachts', template: '%s · Blackpearl Yachts' },
  description: 'Superyacht brokerage, charter and management. Yachts of 24 to 90 metres, found and chartered with complete discretion.',
  openGraph: { siteName: 'Blackpearl Yachts', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400&display=swap" />
      </head>
      <body>
        <CurrencyProvider>
          <Header />
          {children}
          <footer className="wrap">
            <NewsletterForm />
            <div className="fgrid">
              <span>© {new Date().getFullYear()} Blackpearl Yachts</span>
              <span>Colombo · Antibes · Athens</span>
              <span>{wa ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp a broker</a> : 'An original design with fictional content'}</span>
            </div>
          </footer>
          <CookieBanner />
        </CurrencyProvider>
      </body>
    </html>
  );
}
