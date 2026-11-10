'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Scroll reveals and pointer-tracked card glow. */
export default function Effects() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const move = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.('.card') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', move, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener('pointermove', move);
    };
  }, [pathname]);
  return null;
}
