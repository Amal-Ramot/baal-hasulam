import Link from 'next/link';
import { fmt, type Work } from '@/lib/library';

export default function WorkCard({ work, big, i }: { work: Work; big?: boolean; i: number }) {
  return (
    <Link href={`/work/${work.slug}/`} className={`card reveal${big ? ' big' : ''}`} style={{ ['--i' as string]: i % 3 }}>
      <span className="glyph" aria-hidden>
        {work.title.replace(/^ה/, '')[0]}
      </span>
      <span className="cat">{work.category}</span>
      <h3>{work.title}</h3>
      {work.subtitle && <span className="sub">{work.subtitle}</span>}
      <p className="blurb">{work.blurb}</p>
      <div className="meta">
        <span>{fmt(work.pageCount)} עמודים</span>
        <span>{work.year}</span>
        <span className="go">
          לקריאה <span className="arrow">←</span>
        </span>
      </div>
    </Link>
  );
}
