import type { Metadata } from 'next';
import { Suspense } from 'react';
import Reader from '@/components/Reader';

export const metadata: Metadata = { title: 'קריאה' };

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="reader" style={{ minHeight: '80vh' }} />}>
      <Reader />
    </Suspense>
  );
}
