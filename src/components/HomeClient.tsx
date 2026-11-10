'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLast, getMarks, type Mark } from '@/lib/store';
import { readHref } from '@/lib/site';

export function ContinueReading() {
  const [last, setLast] = useState<Mark | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  useEffect(() => {
    setLast(getLast());
    setMarks(getMarks());
  }, []);
  if (!last && !marks.length) return null;
  return (
    <>
      {last && (
        <div className="cont">
          <div>
            <small>להמשיך מהמקום שעצרתם</small>
            <b>
              {last.work} — {last.title}
            </b>
          </div>
          <Link className="btn btn-gold" href={readHref(last.slug, last.n)}>
            המשך קריאה <span className="arrow">←</span>
          </Link>
        </div>
      )}
      {marks.length > 0 && (
        <div className="marks" aria-label="הסימניות שלי">
          {marks.slice(0, 8).map((m) => (
            <Link key={m.slug + m.n} className="chip" href={readHref(m.slug, m.n)}>
              ★ {m.work} · {m.title}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

type Item = { slug: string; work: string; n: number; b: number; where: string; text: string };

export function DailyPassage({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(Math.floor(Date.now() / 86400000) % items.length);
  }, [items.length]);
  const it = items[i];
  return (
    <figure className="quote" style={{ margin: 0 }}>
      <span className="eyebrow">מתוך הכתבים</span>
      <blockquote key={i} className="rise" style={{ marginTop: 26 }}>
        {it.text}
      </blockquote>
      <figcaption>
        <cite>
          <Link href={readHref(it.slug, it.n, it.b)}>
            {it.work === it.where ? it.work : `${it.work} · ${it.where.replace(it.work + ', ', '')}`} <span className="arrow">←</span>
          </Link>
        </cite>
        <div className="qnav">
          <button className="chip" onClick={() => setI((i + 1) % items.length)}>
            קטע נוסף
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
