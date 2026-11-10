'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMarks, getPrefs, setLast, setPrefs, toggleMark, type Prefs } from '@/lib/store';

type Props = { slug: string; n: number; total: number; work: string; title: string };

export default function ReaderDock({ slug, n, total, work, title }: Props) {
  const router = useRouter();
  const [prefs, setP] = useState<Prefs>({ fs: 0, font: 'serif' });
  const [marked, setMarked] = useState(false);
  const prev = n > 1 ? `/read/${slug}/${n - 1}/` : null;
  const next = n < total ? `/read/${slug}/${n + 1}/` : null;

  useEffect(() => {
    setP(getPrefs());
    setMarked(getMarks().some((m) => m.slug === slug && m.n === n));
    setLast({ slug, n, work, title });
  }, [slug, n, work, title]);

  // apply preferences
  useEffect(() => {
    const el = document.getElementById('reader');
    if (!el) return;
    const base = window.innerWidth < 700 ? 19 : 21;
    el.style.setProperty('--fs', `${base + prefs.fs * 1.5}px`);
    el.style.setProperty('--measure', `${720 + prefs.fs * 30}px`);
    el.dataset.font = prefs.font;
  }, [prefs]);

  // progress bar, keyboard, commentary markers
  useEffect(() => {
    const bar = document.getElementById('progress');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft' && next) router.push(next);
      if (e.key === 'ArrowRight' && prev) router.push(prev);
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.op') as HTMLElement | null;
      if (!btn) return;
      const blk = btn.closest('.blk');
      const det = blk?.querySelector('details.notes') as HTMLDetailsElement | null;
      const li = det?.querySelector(`li[data-note="${btn.dataset.n}"]`) as HTMLElement | null;
      if (!det || !li) return;
      det.open = true;
      det.querySelectorAll('.hit').forEach((x) => x.classList.remove('hit'));
      li.classList.add('hit');
      li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [next, prev, router]);

  const update = (p: Prefs) => {
    setP(p);
    setPrefs(p);
  };

  return (
    <div className="dock" role="toolbar" aria-label="כלי קריאה">
      {prev ? (
        <Link href={prev} aria-label="העמוד הקודם">→</Link>
      ) : (
        <a aria-disabled="true">→</a>
      )}
      <span className="pn">
        {n} / {total}
      </span>
      {next ? (
        <Link href={next} aria-label="העמוד הבא">←</Link>
      ) : (
        <a aria-disabled="true">←</a>
      )}
      <span className="sep" />
      <button onClick={() => update({ ...prefs, fs: Math.max(-3, prefs.fs - 1) })} aria-label="הקטנת הגופן">
        א−
      </button>
      <button onClick={() => update({ ...prefs, fs: Math.min(6, prefs.fs + 1) })} aria-label="הגדלת הגופן" style={{ fontSize: 18 }}>
        א+
      </button>
      <button className="hide-s" onClick={() => update({ ...prefs, font: prefs.font === 'serif' ? 'sans' : 'serif' })} aria-label="החלפת גופן">
        {prefs.font === 'serif' ? 'גופן נקי' : 'גופן ספר'}
      </button>
      <span className="sep" />
      <button aria-pressed={marked} onClick={() => setMarked(toggleMark({ slug, n, work, title }))} aria-label="סימנייה">
        {marked ? '★' : '☆'}
      </button>
      <Link className="hide-s" href={`/work/${slug}/`}>
        תוכן
      </Link>
    </div>
  );
}
