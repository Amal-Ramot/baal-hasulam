import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap phead" style={{ minHeight: '60vh' }}>
      <span className="eyebrow">404</span>
      <h1>העמוד לא נמצא</h1>
      <p className="lede">ייתכן שהקישור השתנה. אפשר לחזור אל הספרייה ולמצוא משם את הדרך.</p>
      <div className="hero-cta">
        <Link href="/library/" className="btn btn-gold">
          אל הספרייה <span className="arrow">←</span>
        </Link>
      </div>
    </div>
  );
}
