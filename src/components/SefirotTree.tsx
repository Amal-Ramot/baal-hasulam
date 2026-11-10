'use client';
import Link from 'next/link';
import { useState } from 'react';
import { readHref } from '@/lib/site';

type Item = { t: string; d: string; cite: string; n: number; b: number };
// each of the ten sefirot belongs to one of the five behinot: keter, hokhma, bina, zeir anpin (six sefirot), malkhut
const S = [
  { n: 'כתר', x: 200, y: 50, g: 'כתר' },
  { n: 'חכמה', x: 320, y: 130, g: 'חכמה' },
  { n: 'בינה', x: 80, y: 130, g: 'בינה' },
  { n: 'חסד', x: 320, y: 250, g: 'זעיר אנפין' },
  { n: 'גבורה', x: 80, y: 250, g: 'זעיר אנפין' },
  { n: 'תפארת', x: 200, y: 310, g: 'זעיר אנפין' },
  { n: 'נצח', x: 320, y: 410, g: 'זעיר אנפין' },
  { n: 'הוד', x: 80, y: 410, g: 'זעיר אנפין' },
  { n: 'יסוד', x: 200, y: 470, g: 'זעיר אנפין' },
  { n: 'מלכות', x: 200, y: 580, g: 'מלכות' },
];
const EDGES = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5], [1, 5], [2, 5], [0, 5], [3, 6], [4, 7], [5, 6], [5, 7], [6, 7], [5, 8], [6, 8], [7, 8], [8, 9], [6, 9], [7, 9]];

export default function SefirotTree({ items }: { items: Item[] }) {
  const [g, setG] = useState('כתר');
  const it = items.find((x) => x.t === g);
  return (
    <div className="tree-wrap">
      <svg className="tree" viewBox="0 0 400 640" role="group" aria-label="אילן עשר הספירות">
        {EDGES.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={S[a].x} y1={S[a].y} x2={S[b].x} y2={S[b].y} />
        ))}
        {S.map((x) => (
          <g key={x.n} role="button" tabIndex={0} data-on={x.g === g} aria-pressed={x.g === g} aria-label={x.n} onClick={() => setG(x.g)} onMouseEnter={() => setG(x.g)} onFocus={() => setG(x.g)}>
            <circle cx={x.x} cy={x.y} r={x.g === g ? 42 : 38} />
            <text x={x.x} y={x.y}>{x.n}</text>
          </g>
        ))}
      </svg>
      <div className="sef-panel" aria-live="polite">
        <span className="k">פירוש המלות</span>
        <h3 key={g} className="rise">{g}</h3>
        {it && (
          <>
            <p>{it.d}</p>
            <cite>{it.cite}</cite>
            <div className="hero-cta">
              <Link className="btn btn-line" href={readHref('tes', it.n, it.b)}>
                אל המקור <span className="arrow">←</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
