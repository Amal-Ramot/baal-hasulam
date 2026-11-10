import fs from 'node:fs';
import path from 'node:path';

export type TocEntry = { path: string[]; title: string; unit: string | null; pages: { n: number; label: string }[] };
export type Work = {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  year: string;
  blurb: string;
  textNote?: string;
  source: { edition: string; url: string; via: string };
  pageCount: number;
  chars: number;
  words: number;
  toc: TocEntry[];
};
export type Block = { html: string; l?: string; h?: string; notes?: string[] };
export type Page = { n: number; title: string; path: string[]; unit: string | null; label: string; blocks: Block[] };
export type Featured = { slug: string; work: string; n: number; b: number; where: string; text: string };

const ROOT = path.join(process.cwd(), 'content');
let cache: Work[] | null = null;

export function getWorks(): Work[] {
  if (!cache) cache = JSON.parse(fs.readFileSync(path.join(ROOT, 'works.json'), 'utf8')) as Work[];
  return cache;
}
export function getWork(slug: string): Work | undefined {
  return getWorks().find((w) => w.slug === slug);
}
export function getPage(slug: string, n: number): Page {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'pages', slug, `${n}.json`), 'utf8')) as Page;
}
export function getFeatured(): Featured[] {
  const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'featured.json'), 'utf8')) as Featured[];
  return all.filter((f) => !f.text.startsWith('(') && !f.text.includes('עיין שם') && f.text.length <= 260);
}
export function pageTitle(p: { title: string; unit: string | null; label: string }) {
  if (!p.label) return p.title;
  if (p.label.startsWith('פרק')) return `${p.title} · ${p.label}`;
  const many = p.label.includes('–');
  const unit = p.unit === 'אות' ? (many ? 'אותיות' : 'אות') : '';
  return `${p.title} · ${unit} ${p.label}`.replace('  ', ' ');
}
export function chipLabel(unit: string | null, label: string, i: number) {
  if (!label) return String(i + 1);
  return label.replace(/^פרקים? /, '');
}
export const fmt = (n: number) => new Intl.NumberFormat('he-IL').format(n);

export type Term = { t: string; d: string; part: string; l: string; n: number; b: number };
/** Baal HaSulam's own definitions, from the "answers on terminology" tables of Talmud Eser HaSefirot. */
export function getGlossary(): Term[] {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'glossary.json'), 'utf8')) as Term[];
}

/** Works that are not yet part of the digital library. */
export const MISSING = [
  { title: 'פנים מאירות ומסבירות', note: 'פירוש על "עץ חיים" לאר"י, תרפ"ז' },
  { title: 'בית שער הכוונות', note: 'ביאור לשער הכוונות' },
  { title: 'אור הבהיר', note: 'אילן ולקסיקון מושגים' },
  { title: 'פרי חכם', note: 'אגרות, מאמרים ושיחות' },
  { title: 'שמעתי', note: 'מאמרים שנרשמו מפיו בידי בנו, הרב"ש' },
  { title: 'כתבי הדור האחרון', note: 'כתבים חברתיים ועיתון "האומה"' },
];
