export type Mark = { slug: string; n: number; work: string; title: string };
const read = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
export const getLast = () => read<Mark | null>('bs-last', null);
export const setLast = (m: Mark) => write('bs-last', m);
export const getMarks = () => read<Mark[]>('bs-marks', []);
export const toggleMark = (m: Mark) => {
  const all = getMarks();
  const i = all.findIndex((x) => x.slug === m.slug && x.n === m.n);
  if (i >= 0) all.splice(i, 1);
  else all.unshift(m);
  write('bs-marks', all.slice(0, 50));
  return i < 0;
};
export type Prefs = { fs: number; font: 'serif' | 'sans' };
export const getPrefs = () => read<Prefs>('bs-reader', { fs: 0, font: 'serif' });
export const setPrefs = (p: Prefs) => write('bs-reader', p);
