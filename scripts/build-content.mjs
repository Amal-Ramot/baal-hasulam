// Downloads Baal HaSulam's Hebrew texts from Sefaria (cached in .cache/sefaria)
// and normalises them into content/works.json + content/pages/<work>/<n>.json.
// Run: npm run content
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache/sefaria');
const OUT = path.join(ROOT, 'content');
const TARGET = 15000; // characters per reading page

const SOURCES = {
  sulam: ['Sulam on Zohar', 'Zohar with Sulam commentary, Jerusalem 1945'],
  intro_zohar: ["Baal HaSulam's Introduction to Zohar", "Baal HaSulam's Introduction to Zohar, ed. Zohar HaSulam, 2019"],
  preface_zohar: ["Baal HaSulam's Preface to Zohar", 'Zohar with Sulam commentary, Jerusalem 1945'],
  intro_sulam: ['Introduction to Sulam Commentary', 'Zohar with Sulam commentary, Jerusalem 1945'],
  matan_torah: ['Kuntres Mattan Torah', 'Sefer Matan Torah, ed. Zohar HaSulam, 2019'],
  ohr_penimi: ['Ohr Penimi on Talmud Eser HaSefirot', 'Jerusalem, 1956-1966'],
  petichah: ['Petichah LeChokhmat HaKabbalah', 'Zohar with Sulam commentary, Jerusalem 1945'],
  tes: ['Talmud Eser HaSefirot', 'Jerusalem, 1956-1966'],
};

async function load(key) {
  const file = path.join(CACHE, key + '.json');
  if (!fs.existsSync(file)) {
    const [title, version] = SOURCES[key];
    const url = 'https://www.sefaria.org/download/version/' + encodeURIComponent(`${title} - he - ${version}.json`);
    console.log('downloading', title);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ---------- helpers ----------
const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
export function heNum(n) {
  let s = '';
  if (n >= 1000) { s += heNum(Math.floor(n / 1000)) + "'"; n %= 1000; }
  s += HUNDREDS[Math.floor(n / 100)];
  n %= 100;
  if (n === 15) return s + 'טו';
  if (n === 16) return s + 'טז';
  return s + TENS[Math.floor(n / 10)] + ONES[n % 10];
}

const KEEP = new Set(['b', 'i', 'em', 'strong', 'small', 'br', 'sup', 'sub', 'u']);
function clean(html) {
  let s = String(html);
  // footnotes -> inline source reference
  s = s.replace(/<sup class="footnote-marker">[^<]*<\/sup>\s*<i class="footnote">([\s\S]*?)<\/i>/g, '<small class="fn">$1</small> ');
  // commentary markers -> buttons
  s = s.replace(/<i data-commentator="[^"]*" data-label="([^"]*)" data-order="(\d+)"><\/i>/g, '<button type="button" class="op" data-n="$2">$1</button>');
  s = s.replace(/<big>/g, '<span class="big">').replace(/<\/big>/g, '</span>');
  s = s.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (m, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (tag === 'button' || tag === 'span') return m;
    if (tag === 'small' && attrs.includes('class="fn"')) return m;
    if (!KEEP.has(tag)) return '';
    return tag === 'br' ? '<br>' : `<${close}${tag}>`;
  });
  return s.replace(/(<br>\s*){3,}/g, '<br><br>').trim();
}
const strip = (h) => h.replace(/<button[^>]*>[^<]*<\/button>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const nonEmpty = (x) => (typeof x === 'string' ? x.trim().length > 0 : Array.isArray(x) && x.some(nonEmpty));
const flat = (x) => (typeof x === 'string' ? (x.trim() ? [x] : []) : (x || []).flatMap(flat));

function stripLead(html, n) {
  const num = heNum(n).replace(/'/g, "'?");
  const re = new RegExp(`^((?:<[^>]+>)*)\\s*${num}["'׳״]?\\s*[.)]\\s*`);
  return html.replace(re, '$1');
}

// A leaf = an ordered list of units. unit: {label?, heading?, segs:[html], notes?:[html]}
function unitsDepth1(arr) {
  return arr.filter(nonEmpty).map((s) => ({ segs: flat(s).map(clean) }));
}
function unitsDepth2(arr) {
  const units = [];
  arr.forEach((ch, i) => {
    const segs = flat(ch).map(clean);
    if (!segs.length) return;
    segs[0] = stripLead(segs[0], i + 1);
    units.push({ label: heNum(i + 1), segs });
  });
  return units;
}

// ---------- pagination ----------
function paginate(work, leaves) {
  const pages = [];
  const toc = [];
  for (const leaf of leaves) {
    if (!leaf.units.length) continue;
    const entry = { path: leaf.path, title: leaf.title, unit: leaf.unitName || null, pages: [] };
    let cur = null;
    const flush = () => {
      if (!cur) return;
      const labels = cur.blocks.map((b) => b.l).filter(Boolean);
      let label = '';
      const chaps = [...new Set(cur.blocks.map((b) => b.c).filter(Boolean))];
      if (chaps.length) label = chaps.length > 1 ? `פרקים ${chaps[0]}–${chaps[chaps.length - 1]}` : `פרק ${chaps[0]}`;
      else if (labels.length) label = labels.length > 1 ? `${labels[0]}–${labels[labels.length - 1]}` : labels[0];
      for (const b of cur.blocks) delete b.c;
      const n = pages.length + 1;
      pages.push({ n, title: leaf.title, path: leaf.path, unit: leaf.unitName || null, label, blocks: cur.blocks });
      entry.pages.push({ n, label });
      cur = null;
    };
    for (const u of leaf.units) {
      const html = u.segs.map((s) => `<p>${s}</p>`).join('');
      const size = html.length + (u.notes || []).reduce((a, b) => a + b.length, 0);
      if (cur && cur.size + size > TARGET * 1.35 && cur.size > TARGET * 0.4) flush();
      if (!cur) cur = { blocks: [], size: 0 };
      const block = { html };
      if (u.label) block.l = u.label;
      if (u.heading) block.h = u.heading;
      if (u.chap) block.c = u.chap;
      if (u.notes?.length) block.notes = u.notes;
      cur.blocks.push(block);
      cur.size += size;
      if (cur.size >= TARGET) flush();
    }
    flush();
    toc.push(entry);
  }
  const dir = path.join(OUT, 'pages', work.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let chars = 0;
  let words = 0;
  for (const p of pages) {
    for (const b of p.blocks) {
      const t = strip(b.html) + ' ' + (b.notes || []).map(strip).join(' ');
      chars += t.length;
      words += t.split(' ').length;
    }
    fs.writeFileSync(path.join(dir, p.n + '.json'), JSON.stringify(p));
  }
  return { ...work, pageCount: pages.length, chars, words, toc };
}

// ---------- works ----------
const works = [];

async function simple(key, meta, unitName) {
  const d = await load(key);
  const leaves = [{ path: [], title: meta.title, unitName, units: unitsDepth2(d.text) }];
  works.push(paginate({ ...meta, source: src(d) }, leaves));
}
const src = (d) => ({ edition: d.versionTitle, url: d.versionSource, via: 'Sefaria' });

// 1. Short introductions
await simple('petichah', {
  slug: 'peticha', title: 'פתיחה לחכמת הקבלה', category: 'הקדמות', year: 'תרצ"ז–תש"ה',
  blurb: 'מפת היסוד של חכמת הקבלה: מחשבת הבריאה, ארבע הבחינות, הצמצום, המסך, חמשת הפרצופים והעולמות — בקיצור ובסדר מופתי.',
}, 'אות');
await simple('intro_zohar', {
  slug: 'hakdama-zohar', title: 'הקדמה לספר הזוהר', category: 'הקדמות', year: 'תש"ה',
  blurb: 'שאלות היסוד של הקיום — מה מהותנו, מה תפקידנו בשלשלת המציאות — והתשובה: מן הרצון לקבל אל הרצון להשפיע.',
}, 'אות');
await simple('preface_zohar', {
  slug: 'mavo-zohar', title: 'מבוא לספר הזוהר', category: 'הקדמות', year: 'תש"ה',
  blurb: 'גדרי ההשגה: חומר, צורה שבחומר, צורה מופשטת ומהות — ובמה בדיוק עוסק ספר הזוהר.',
}, 'אות');
await simple('intro_sulam', {
  slug: 'peticha-sulam', title: 'פתיחה לפירוש הסולם', category: 'הקדמות', year: 'תש"ה',
  blurb: 'עשר הספירות, שלושת הקווים, עליית המלכות לבינה וסדר המוחין — המפתחות הנחוצים ללימוד הזוהר עם פירוש הסולם.',
}, 'אות');

// 2. Matan Torah essays
{
  const d = await load('matan_torah');
  const leaves = d.schema.nodes.map((node) => {
    const t = d.text[node.enTitle];
    const title = node.heTitle.replace(/^(הקדמה|מאמר) [א-ת]'; /, '');
    const deep = Array.isArray(t[0]);
    const units = deep ? unitsDepth2(t) : unitsDepth1(t);
    return { path: [], title, units };
  });
  works.push(paginate({
    slug: 'matan-torah', title: 'מתן תורה', subtitle: 'קונטרסים ומאמרים', category: 'מאמרים', year: 'תרצ"ג',
    blurb: 'מתן תורה, הערבות, השלום, החירות, מהות הדת ומטרתה — המאמרים שבהם פנה בעל הסולם אל הציבור הרחב.',
    source: src(d),
  }, leaves));
}

// 3. Talmud Eser HaSefirot (+ Ohr Penimi)
{
  const d = await load('tes');
  const op = (await load('ohr_penimi')).text;
  const opParts = op[''];
  const leaves = [];
  leaves.push({ path: [], title: 'הקדמה לתלמוד עשר הספירות', units: unitsDepth1(d.text.Introduction) });
  const partNodes = d.schema.nodes.filter((n) => n.nodes);
  partNodes.forEach((part, pi) => {
    const partTitle = part.heTitle;
    const data = d.text[part.enTitle];
    const notes = opParts[pi] || [];
    for (const node of part.nodes) {
      const t = data[node.enTitle];
      if (!t || !nonEmpty(t)) continue;
      if (node.enTitle === '') {
        const units = [];
        const aligned = t.length === notes.length;
        t.forEach((ch, ci) => {
          const chNotes = aligned ? flat(notes[ci]).map(clean) : [];
          if (typeof ch === 'string') {
            if (!ch.trim()) return;
            units.push({ label: heNum(ci + 1), segs: [clean(ch)], notes: chNotes });
          } else {
            const seifs = ch.filter(nonEmpty);
            let used = 0;
            seifs.forEach((seif, si) => {
              const html = clean(seif);
              const orders = [...html.matchAll(/data-n="(\d+)"/g)].map((m) => +m[1]);
              const max = orders.length ? Math.max(...orders) : used;
              const last = si === seifs.length - 1;
              const upto = last ? chNotes.length : Math.min(max, chNotes.length);
              const mine = chNotes.slice(used, upto);
              // renumber markers relative to this block's notes
              const local = html.replace(/data-n="(\d+)"/g, (m, n) => `data-n="${+n - used}"`);
              units.push({ chap: heNum(ci + 1), label: heNum(si + 1), heading: si === 0 ? `פרק ${heNum(ci + 1)}` : undefined, segs: [local], notes: mine });
              used = Math.max(used, upto);
            });
          }
        });
        const deep = Array.isArray(t[0]);
        leaves.push({ path: [partTitle], title: deep ? 'פנים — דברי האר"י עם אור פנימי' : 'דברי האר"י עם אור פנימי', unitName: 'אות', units });
        if (!aligned) {
          const u = notes.map((c, ci) => ({ label: heNum(ci + 1), segs: flat(c).map(clean) })).filter((x) => x.segs.length);
          leaves.push({ path: [partTitle], title: 'אור פנימי', unitName: 'אות', units: u });
        }
      } else {
        const deep = t.some((x) => Array.isArray(x));
        const units = deep ? unitsDepth2(t) : unitsDepth1(t);
        leaves.push({ path: [partTitle], title: node.heTitle, unitName: deep ? 'אות' : null, units });
      }
    }
  });
  works.push(paginate({
    slug: 'tes', title: 'תלמוד עשר הספירות', subtitle: 'עם אור פנימי והסתכלות פנימית', category: 'חיבורי היסוד', year: 'תרצ"ז–תשי"ג',
    blurb: 'ששה־עשר חלקים המסדרים את כתבי האר"י כתלמוד שיטתי — מן הצמצום והקו ועד עולמות בריאה, יצירה ועשיה — עם לוחות שאלות ותשובות לחזרה.',
    source: src(d),
  }, leaves));
}

// 4. Sulam on Zohar
{
  const d = await load('sulam');
  const leaves = d.schema.nodes.map((node) => ({
    path: [], title: node.heTitle === 'הקדמה' ? 'הקדמת ספר הזוהר' : node.heTitle, unitName: 'אות',
    units: unitsDepth2(d.text[node.enTitle] || []),
  }));
  works.push(paginate({
    slug: 'zohar-sulam', title: 'הסולם על ספר הזוהר', subtitle: 'פירוש הסולם', category: 'חיבורי היסוד', year: 'תש"ג–תשי"ג',
    blurb: 'הפירוש שעל שמו נקרא: תרגום וביאור רצוף של ספר הזוהר, פרשה אחר פרשה, בשפה שכל לומד יכול לעלות בה שלב אחר שלב.',
    source: src(d),
  }, leaves));
}

// order for display
const ORDER = ['zohar-sulam', 'tes', 'peticha', 'hakdama-zohar', 'mavo-zohar', 'peticha-sulam', 'matan-torah'];
works.sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

// ---------- featured passages (verbatim, located by phrase) ----------
const PHRASES = [
  ['matan-torah', 'כל ישראל ערבים זה לזה'],
  ['matan-torah', 'אהבת זולתו'],
  ['peticha', 'מחשבת הבריאה'],
  ['peticha', 'השתוות הצורה'],
  ['hakdama-zohar', 'להנות לנבראיו'],
  ['hakdama-zohar', 'רצון לקבל'],
  ['tes', 'אין לך אדם מישראל'],
  ['mavo-zohar', 'צורה מופשטת'],
  ['peticha-sulam', 'עשר ולא תשע'],
  ['matan-torah', 'תכלית הבריאה'],
  ['tes', 'מחזירו למוטב'],
  ['hakdama-zohar', 'גמר התיקון'],
  ['matan-torah', 'מהות הדת'],
  ['peticha', 'אין אור בלי כלי'],
  ['matan-torah', 'חירות'],
  ['matan-torah', 'השלום'],
  ['matan-torah', 'חרות ממלאך המות'],
];
const featured = [];
for (const [slug, phrase] of PHRASES) {
  const w = works.find((x) => x.slug === slug);
  outer: for (let n = 1; n <= w.pageCount; n++) {
    const p = JSON.parse(fs.readFileSync(path.join(OUT, 'pages', slug, n + '.json'), 'utf8'));
    for (let bi = 0; bi < p.blocks.length; bi++) {
      const text = strip(p.blocks[bi].html.replace(/<small class="fn">[\s\S]*?<\/small>/g, ''));
      const at = text.indexOf(phrase);
      if (at < 0) continue;
      let start = text.lastIndexOf('. ', at) + 1;
      let end = text.indexOf('. ', at + phrase.length);
      if (end < 0) end = text.length;
      let q = text.slice(start, end + 1).trim();
      if (q.length < 60 || q.length > 330) continue;
      featured.push({ slug, work: w.title, n, b: bi, where: p.title + (p.blocks[bi].l ? `, ${p.unit || ''} ${p.blocks[bi].l}`.replace('  ', ' ') : ''), text: q });
      break outer;
    }
  }
}

fs.writeFileSync(path.join(OUT, 'works.json'), JSON.stringify(works));
fs.writeFileSync(path.join(OUT, 'featured.json'), JSON.stringify(featured, null, 1));
for (const w of works) console.log(w.slug.padEnd(16), String(w.pageCount).padStart(4), 'pages', String(w.words).padStart(8), 'words', w.toc.length, 'sections');
console.log('featured', featured.length);
