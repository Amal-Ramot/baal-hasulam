import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@fontsource-variable/frank-ruhl-libre';
import '@fontsource-variable/heebo';
import './globals.css';
import { NAV, SITE } from '@/lib/site';
import HeaderTools from '@/components/HeaderTools';
import Effects from '@/components/Effects';
import { LadderMark } from '@/components/Ladder';

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, locale: 'he_IL', type: 'website' },
};
export const viewport: Viewport = {
  themeColor: '#0b0d12',
};

// dark is the default; a visitor's own choice (the header toggle) is remembered
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('bs-theme')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" data-theme="dark" suppressHydrationWarning>
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
            <HeaderTools />
          </div>
        </header>
        <main>{children}</main>
        <footer className="ftr">
          <div className="wrap ftr-in">
            <div>
              <b>בעל הסולם</b>
              <p>
                באתר מופיעים דברי בעל הסולם בלבד, בלשונו, ללא הערות, השלמות או כותרות של מהדירים מאוחרים. מקור הטקסטים: המהדורות הדיגיטליות של{' '}
                <a href="https://www.sefaria.org.il" target="_blank" rel="noreferrer">
                  ספריא
                </a>
                ; פירוט הנוסח מופיע בעמוד של כל חיבור.
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
