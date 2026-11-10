'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReaderDock from '@/components/ReaderDock';
import { BASE, readHref } from '@/lib/site';
import { heNum } from '@/lib/hebrew';

type Block = { html: string; l?: string; h?: string; notes?: string[] };
type Page = {
  n: number; title: string; path: string[]; unit: string | null; label: string; blocks: Block[];
  work: string; total: number; single: boolean; ft: string; prev: string | null; next: string | null;
};
const url = (w: string, n: number) => `${BASE}/data/${w}/${n}.json`;

export default function Reader() {
  const params = useSearchParams();
  const slug = params.get('w') || '';
  const n = Math.max(1, parseInt(params.get('n') || '1', 10) || 1);
  const [page, setPage] = useState<Page | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    fetch(url(slug, n))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p: Page) => {
        if (!alive) return;
        setPage(p);
        if (p.n < p.total) fetch(url(slug, p.n + 1)).catch(() => {}); // warm the next page
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [slug, n]);

  // title + scroll position once the text is on the page
  useEffect(() => {
    if (!page || page.n !== n) return;
    document.title = `${page.ft} · ${page.work} · בעל הסולם`;
    const el = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (el) {
      el.classList.add('target');
      el.scrollIntoView({ block: 'start' });
    } else window.scrollTo(0, 0);
  }, [page, n]);

  if (failed)
    return (
      <div className="wrap phead" style={{ minHeight: '60vh' }}>
        <span className="eyebrow">404</span>
        <h1>העמוד לא נמצא</h1>
        <div className="hero-cta">
          <Link href="/library/" className="btn btn-gold">
            אל הספרייה <span className="arrow">←</span>
          </Link>
        </div>
      </div>
    );
  if (!page) return <div className="reader" style={{ minHeight: '80vh' }} />;

  return (
    <article className="reader" id="reader">
      <div className="progress" id="progress" />
      <header className="reader-head">
        <nav className="crumbs" aria-label="מיקום">
          <Link href="/library/">הספרייה</Link>
          <span aria-hidden>/</span>
          <Link href={`/work/${slug}/`}>{page.work}</Link>
          {page.path.map((p) => (
            <span key={p}>
              <span aria-hidden>/ </span>
              {p}
            </span>
          ))}
        </nav>
        <h1>{page.single ? page.work : page.title}</h1>
        {page.label && <p className="where">{page.ft.split(' · ').slice(1).join(' · ')}</p>}
      </header>

      <div className="text" key={`${slug}-${page.n}`}>
        {page.blocks.map((b, i) => (
          <section className="blk" id={`b${i}`} key={i}>
            {b.h && <h2>{b.h}</h2>}
            {b.l && (
              <a className="lbl" href={`#b${i}`} title={`${page.unit ?? ''} ${b.l}`.trim()}>
                {b.l}
              </a>
            )}
            <div dangerouslySetInnerHTML={{ __html: b.html }} />
            {b.notes && b.notes.length > 0 && (
              <details className="notes">
                <summary>אור פנימי · {b.notes.length} ביאורים</summary>
                <ol>
                  {b.notes.map((note, k) => (
                    <li key={k} data-note={k + 1}>
                      <i>{heNum(k + 1)}</i>
                      <span dangerouslySetInnerHTML={{ __html: note }} />
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </section>
        ))}
      </div>

      <nav className="pager" aria-label="דפדוף">
        {page.prev && (
          <Link href={readHref(slug, page.n - 1)}>
            <small>→ הקודם</small>
            <b>{page.prev}</b>
          </Link>
        )}
        {page.next && (
          <Link className="next" href={readHref(slug, page.n + 1)}>
            <small>הבא ←</small>
            <b>{page.next}</b>
          </Link>
        )}
      </nav>

      <ReaderDock slug={slug} n={page.n} total={page.total} work={page.work} title={page.ft} />
    </article>
  );
}
