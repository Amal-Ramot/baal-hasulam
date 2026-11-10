import type { Metadata } from 'next';
import Link from 'next/link';
import { fmt, getWorks, MISSING } from '@/lib/library';
import { heNum } from '@/lib/hebrew';

export const metadata: Metadata = { title: 'הספרייה' };

export default function Library() {
  const works = getWorks();
  return (
    <div className="wrap">
      <header className="phead">
        <span className="eyebrow">הספרייה</span>
        <h1>כל החיבורים</h1>
        <p className="lede">שבעה חיבורים, מן המאמרים הקצרים ועד שני מפעלי החיים — פירוש הסולם ותלמוד עשר הספירות. לחצו על חיבור כדי לראות את תוכן העניינים המלא.</p>
      </header>
      <div>
        {works.map((w, i) => (
          <Link key={w.slug} href={`/work/${w.slug}/`} className="lib-row reveal">
            <span className="num">{heNum(i + 1)}</span>
            <div>
              <h3>{w.title}</h3>
              <p>{w.blurb}</p>
            </div>
            <div className="side">
              <b>{fmt(w.pageCount)} עמודים</b>
              {w.category} · {w.year}
            </div>
          </Link>
        ))}
      </div>
      <section className="sec">
        <div className="sec-head">
          <h2 style={{ fontSize: 34 }}>עוד מכתביו</h2>
          <p>חיבורים שטרם נכללו בספרייה הדיגיטלית — יתווספו כשתהיה להם מהדורה פתוחה ומוגהת.</p>
        </div>
        <div className="missing">
          {MISSING.map((m) => (
            <div key={m.title}>
              <b>{m.title}</b>
              <span>{m.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
