export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const SITE = {
  name: 'בעל הסולם',
  tagline: 'כל התורה במקום אחד',
  description: 'הספרייה הדיגיטלית של כתבי בעל הסולם, הרב יהודה לייב הלוי אשלג: פירוש הסולם לזוהר, תלמוד עשר הספירות, ההקדמות והמאמרים — לקריאה, לחיפוש וללימוד.',
};
export const NAV = [
  { href: '/library/', label: 'הספרייה' },
  { href: '/concepts/', label: 'מושגים' },
  { href: '/life/', label: 'תולדות' },
  { href: '/search/', label: 'חיפוש' },
];

/** Link to a reading page (and optionally a block inside it). */
export const readHref = (slug: string, n: number, block?: number) => `/read/?w=${slug}&n=${n}${block === undefined ? '' : `#b${block}`}`;
