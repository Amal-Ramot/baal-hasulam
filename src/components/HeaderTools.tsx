'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASE } from '@/lib/site';

type Item = { t: string; s: string; h: string };
const STATIC: Item[] = [
  { t: 'הספרייה', s: 'כל החיבורים', h: '/library/' },
  { t: 'מושגי יסוד', s: 'עשר הספירות ומילון מושגים', h: '/concepts/' },
  { t: 'תולדות חייו', s: 'ציר זמן', h: '/life/' },
  { t: 'חיפוש בכל הכתבים', s: 'חיפוש בטקסט מלא', h: '/search/' },
];
const norm = (s: string) => s.replace(/[֑-ׇ"'׳״]/g, '').toLowerCase();

export default function HeaderTools() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);

  const all = useMemo(() => [...STATIC, ...items], [items]);
  const results = useMemo(() => {
    const n = norm(q.trim());
    const base = n ? all.filter((i) => norm(i.t + ' ' + i.s).includes(n)) : all;
    const out = base.slice(0, 40);
    if (n) out.push({ t: `חפשו ״${q.trim()}״ בכל הכתבים`, s: 'חיפוש בטקסט מלא', h: `/search/?q=${encodeURIComponent(q.trim())}` });
    return out;
  }, [q, all]);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setSel(0);
  }, []);
  const go = useCallback(
    (h: string) => {
      close();
      router.push(h);
    },
    [close, router],
  );

  useEffect(() => {
    if (!open || items.length) return;
    fetch(`${BASE}/search/palette.json`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, [open, items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName || '');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('bs-theme', next);
    } catch {}
  };

  return (
    <div className="hdr-tools">
      <button className="kbtn" onClick={() => setOpen(true)} aria-label="פתיחת חיפוש מהיר">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span>חיפוש מהיר</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button className="ibtn" onClick={toggleTheme} aria-label="החלפת ערכת צבעים">
        <svg className="only-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg className="only-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        </svg>
      </button>
      {open && (
        <div className="pal-back" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="pal" role="dialog" aria-modal="true" aria-label="חיפוש מהיר">
            <input
              autoFocus
              value={q}
              placeholder="לאן תרצו להגיע? חיבור, פרשה, חלק…"
              onChange={(e) => {
                setQ(e.target.value);
                setSel(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSel((s) => Math.min(s + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSel((s) => Math.max(s - 1, 0));
                } else if (e.key === 'Enter' && results[sel]) go(results[sel].h);
              }}
            />
            <ul ref={listRef} role="listbox">
              {results.map((r, i) => (
                <li key={r.h + i} role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => go(r.h)}>
                  <b>{r.t}</b>
                  <small>{r.s}</small>
                </li>
              ))}
            </ul>
            <div className="hint">
              <span>↑↓ ניווט</span>
              <span>Enter פתיחה</span>
              <span>Esc סגירה</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
