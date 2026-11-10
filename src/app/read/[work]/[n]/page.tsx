import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReaderDock from '@/components/ReaderDock';
import { getPage, getWork, getWorks, pageTitle } from '@/lib/library';
import { heNum } from '@/lib/hebrew';

export const dynamicParams = false;
export function generateStaticParams() {
  return getWorks().flatMap((w) => Array.from({ length: w.pageCount }, (_, i) => ({ work: w.slug, n: String(i + 1) })));
}
type Props = { params: Promise<{ work: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work, n } = await params;
  const w = getWork(work);
  if (!w) return {};
  return { title: `${pageTitle(getPage(work, +n))} · ${w.title}` };
}

export default async function ReadPage({ params }: Props) {
  const { work, n: ns } = await params;
  const w = getWork(work);
  const n = +ns;
  if (!w || !(n >= 1 && n <= w.pageCount)) notFound();
  const page = getPage(work, n);
  const prev = n > 1 ? getPage(work, n - 1) : null;
  const next = n < w.pageCount ? getPage(work, n + 1) : null;
  const title = pageTitle(page);
  const single = w.toc.length === 1;

  return (
    <article className="reader" id="reader">
      <div className="progress" id="progress" />
      <header className="reader-head">
        <nav className="crumbs" aria-label="מיקום">
          <Link href="/library/">הספרייה</Link>
          <span aria-hidden>/</span>
          <Link href={`/work/${w.slug}/`}>{w.title}</Link>
          {page.path.map((p) => (
            <span key={p}>
              <span aria-hidden>/ </span>
              {p}
            </span>
          ))}
        </nav>
        <h1>{single ? w.title : page.title}</h1>
        {page.label && <p className="where">{title.split(' · ').slice(1).join(' · ')}</p>}
      </header>

      <div className="text">
        {page.blocks.map((b, i) => (
          <section className="blk" id={`b${i}`} key={i}>
            {b.h && <h2>{b.h}</h2>}
            {b.l && (
              <a className="lbl" href={`#b${i}`} title={`${page.unit ?? ''} ${b.l}`.trim()}>
                {b.l}
              </a>
            )}
            <div dangerouslySetInnerHTML={{ __html: b.html }} />
            {b.notes && (
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
        {prev && (
          <Link href={`/read/${w.slug}/${n - 1}/`}>
            <small>→ הקודם</small>
            <b>{pageTitle(prev)}</b>
          </Link>
        )}
        {next && (
          <Link className="next" href={`/read/${w.slug}/${n + 1}/`}>
            <small>הבא ←</small>
            <b>{pageTitle(next)}</b>
          </Link>
        )}
      </nav>

      <ReaderDock slug={w.slug} n={n} total={w.pageCount} work={w.title} title={title} />
    </article>
  );
}
