'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BASE, readHref } from '@/lib/site';

type Row = [number, number, string, string, string];
type Hit = { slug: string; work: string; n: number; b: number; where: string; before: string; match: string; after: string };
type Manifest = { slug: string; title: string; files: string[] }[];
const MAX = 150;
const norm = (s: string) => s.replace(/[֑-ׇ]/g, '').replace(/[״“”]/g, '"').replace(/[׳‘’]/g, "'");
const shards = new Map<string, Promise<Row[]>>();
const loadShard = (f: string) => {
  if (!shards.has(f)) shards.set(f, fetch(`${BASE}/search/${f}`).then((r) => r.json()).then((rows: Row[]) => rows.map((r) => [r[0], r[1], r[2], r[3], norm(r[4])] as Row)));
  return shards.get(f)!;
};

export default function SearchClient({ works }: { works: { slug: string; title: string }[] }) {
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle');
  const run = useRef(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') || '');
    setScope(p.get('in') || '');
  }, []);

  useEffect(() => {
    const term = norm(q.trim());
    const id = ++run.current;
    if (term.length < 2) {
      setHits([]);
      setTotal(0);
      setStatus('idle');
      return;
    }
    setStatus('busy');
    const timer = setTimeout(async () => {
      try {
        const manifest: Manifest = await fetch(`${BASE}/search/manifest.json`).then((r) => r.json());
        const found: Hit[] = [];
        let count = 0;
        for (const m of manifest) {
          if (scope && m.slug !== scope) continue;
          for (const f of m.files) {
            const rows = await loadShard(f);
            if (run.current !== id) return;
            for (const r of rows) {
              const at = r[4].indexOf(term);
              if (at < 0) continue;
              count++;
              if (found.length >= MAX) continue;
              const s = Math.max(0, at - 90);
              const e = Math.min(r[4].length, at + term.length + 150);
              found.push({
                slug: m.slug, work: m.title, n: r[0], b: r[1], where: [r[2], r[3]].filter(Boolean).join(' · '),
                before: (s > 0 ? '…' : '') + r[4].slice(s, at), match: r[4].slice(at, at + term.length), after: r[4].slice(at + term.length, e) + (e < r[4].length ? '…' : ''),
              });
            }
            setHits([...found]);
            setTotal(count);
          }
        }
        if (run.current === id) setStatus('done');
      } catch {
        if (run.current === id) setStatus('done');
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q, scope]);

  return (
    <>
      <div className="sbox">
        <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="מילה או צירוף — למשל: השתוות הצורה" aria-label="חיפוש" />
      </div>
      <div className="scopes" role="group" aria-label="היקף החיפוש">
        <button className="chip" aria-pressed={scope === ''} onClick={() => setScope('')}>
          כל הכתבים
        </button>
        {works.map((w) => (
          <button key={w.slug} className="chip" aria-pressed={scope === w.slug} onClick={() => setScope(w.slug)}>
            {w.title}
          </button>
        ))}
      </div>
      <p className="sstat" aria-live="polite">
        {status === 'busy' && (total ? `מחפש… ${total.toLocaleString('he-IL')} מופעים עד כה` : 'מחפש בכתבים…')}
        {status === 'done' && (total ? `${total.toLocaleString('he-IL')} קטעים נמצאו${total > MAX ? ` · מוצגים ${MAX} הראשונים` : ''}` : 'לא נמצאו תוצאות. נסו צירוף קצר יותר או כתיב אחר.')}
        {status === 'idle' && 'הקלידו לפחות שתי אותיות. החיפוש רץ כולו בדפדפן, על הטקסט המלא.'}
      </p>
      <div>
        {hits.map((h, i) => (
          <Link key={i} className="res" href={readHref(h.slug, h.n, h.b)}>
            <small>
              {h.work}
              {h.where && h.where !== h.work ? ` · ${h.where}` : ''}
            </small>
            <p>
              {h.before}
              <mark>{h.match}</mark>
              {h.after}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
