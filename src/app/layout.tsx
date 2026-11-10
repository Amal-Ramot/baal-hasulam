import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@fontsource-variable/frank-ruhl-libre';
import '@fontsource-variable/heebo';
import './globals.css';
import { NAV, SITE } from '@/lib/site';
import { getPaletteIndex } from '@/lib/library';
import HeaderTools from '@/components/HeaderTools';
import Effects from '@/components/Effects';
import { LadderMark } from '@/components/Ladder';

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, locale: 'he_IL', type: 'website' },
};
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0d12' },
    { media: '(prefers-color-scheme: light)', color: '#f5efe2' },
  ],
};

const themeScript = `try{var t=localStorage.getItem('bs-theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="hdr">
          <div className="wrap hdr-in">
            <Link href="/" className="brand" aria-label="בעל הסולם — דף הבית">
              <LadderMark />
              בעל הסולם
            </Link>
            <nav className="nav" aria-label="ניווט ראשי">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <HeaderTools items={getPaletteIndex()} />
          </div>
        </header>
        <main>{children}</main>
        <footer className="ftr">
          <div className="wrap ftr-in">
            <div>
              <b>בעל הסולם</b>
              <p>
                הטקסטים מובאים בלשונם, מתוך המהדורות הדיגיטליות הפתוחות של{' '}
                <a href="https://www.sefaria.org.il" target="_blank" rel="noreferrer">
                  ספריא
                </a>
                . האתר הוא מיזם לימודי ללא מטרות רווח.
              </p>
            </div>
            <nav aria-label="ניווט תחתון">
              <Link href="/">בית</Link>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
        <Effects />
      </body>
    </html>
  );
}
