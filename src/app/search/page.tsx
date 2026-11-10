import type { Metadata } from 'next';
import SearchClient from '@/components/SearchClient';
import { getWorks } from '@/lib/library';

export const metadata: Metadata = { title: 'חיפוש' };

export default function SearchPage() {
  return (
    <div className="wrap">
      <header className="phead" style={{ paddingBottom: 30 }}>
        <span className="eyebrow">חיפוש בטקסט מלא</span>
        <h1>חיפוש בכתבים</h1>
      </header>
      <SearchClient works={getWorks().map((w) => ({ slug: w.slug, title: w.title }))} />
    </div>
  );
}
