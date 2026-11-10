import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { chipLabel, fmt, getWork, getWorks, type TocEntry } from '@/lib/library';

export const dynamicParams = false;
export function generateStaticParams() {
  return getWorks().map((w) => ({ slug: w.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = getWork((await params).slug);
  return { title: w?.title, description: w?.blurb };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();
  const groups: { title: string; entries: TocEntry[] }[] = [];
  for (const e of w.toc) {
    const g = e.path[0] ?? '';
    const last = groups[groups.length - 1];
    if (last && last.title === g) last.entries.push(e);
    else groups.push({ title: g, entries: [e] });
  }
  return (
    <div className="wrap">
      <header className="phead">
        <nav className="crumbs" aria-label="מיקום">
          <Link href="/library/">הספרייה</Link>
          <span aria-hidden>/</span>
          <span>{w.category}</span>
        </nav>
        <h1>{w.title}</h1>
        <p className="lede">{w.blurb}</p>
        <div className="hero-cta">
          <Link href={`/read/${w.slug}/1/`} className="btn btn-gold">
            לקרוא מההתחלה <span className="arrow">←</span>
          </Link>
          <Link href={`/search/?in=${w.slug}`} className="btn btn-line">
            חיפוש בחיבור
          </Link>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{fmt(w.pageCount)}</b>
            <span>עמודי לימוד</span>
          </div>
          <div className="stat">
            <b>{fmt(w.words)}</b>
            <span>מילים</span>
          </div>
          <div className="stat">
            <b>{w.year}</b>
            <span>שנות החיבור וההדפסה</span>
          </div>
        </div>
      </header>

      {groups.map((g, gi) => (
        <section className="toc-part" key={gi}>
          {g.title && <h2>{g.title}</h2>}
          {g.entries.map((e) => (
            <div className="toc-row" key={e.pages[0].n}>
              <Link href={`/read/${w.slug}/${e.pages[0].n}/`}>{e.title}</Link>
              <div className="pgs">
                {e.pages.map((p, i) => (
                  <Link key={p.n} className="pg" href={`/read/${w.slug}/${p.n}/`}>
                    {chipLabel(e.unit, p.label, i)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {w.textNote && (
        <aside className="textnote">
          <b>על הנוסח</b>
          <p>{w.textNote}</p>
        </aside>
      )}
      <p className="srcnote">
        מקור הטקסט: {w.source.edition} ·{' '}
        <a href={w.source.url} target="_blank" rel="noreferrer">
          מקור המהדורה
        </a>{' '}
        · באמצעות ספריא.
      </p>
    </div>
  );
}
