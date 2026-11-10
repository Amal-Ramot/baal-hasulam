'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BASE } from '@/lib/site';

type Term = { t: string; d: string; part: string; l: string; n: number; b: number };
const norm = (s: string) => s.replace(/[֑-ׇ"'׳״]/g, '');

export default function Lexicon() {
  const [all, setAll] = useState<Term[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    fetch(`${BASE}/search/glossary.json`)
      .then((r) => r.json())
      .then(setAll)
      .catch(() => {});
  }, []);
  const hits = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return all.slice(0, 12);
    const starts = all.filter((x) => norm(x.t).startsWith(n));
    const has = all.filter((x) => !norm(x.t).startsWith(n) && norm(x.t).includes(n));
    return [...starts, ...has].slice(0, 60);
  }, [q, all]);
  return (
    <>
      <div className="sbox">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="חפשו ערך — למשל: רשימו, פרסא, נקודים" aria-label="חיפוש בלקסיקון" />
      </div>
      <div className="lex-list" aria-live="polite">
        {hits.map((x) => (
          <Link className="lex-row" key={`${x.n}-${x.b}`} href={`/read/tes/${x.n}/#b${x.b}`}>
            <div>
              <b>{x.t}</b>
              <small>
                {x.part} · אות {x.l}
              </small>
            </div>
            <p>{x.d}</p>
          </Link>
        ))}
        {q.trim() && all.length > 0 && hits.length === 0 && <p className="sstat">אין ערך כזה בלוחות פירוש המלות.</p>}
      </div>
    </>
  );
}
