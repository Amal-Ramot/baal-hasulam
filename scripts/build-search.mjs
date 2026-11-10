// Builds plain-text search shards from content/ into public/search (git-ignored).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/search');
const LIMIT = 1_500_000; // characters per shard
const works = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/works.json'), 'utf8'));
const strip = (h) => h.replace(/<button[^>]*>[^<]*<\/button>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const w of works) {
  let shard = [];
  let size = 0;
  const files = [];
  const flush = () => {
    if (!shard.length) return;
    const name = `${w.slug}-${files.length + 1}.json`;
    fs.writeFileSync(path.join(OUT, name), JSON.stringify(shard));
    files.push(name);
    shard = [];
    size = 0;
  };
  for (let n = 1; n <= w.pageCount; n++) {
    const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/pages', w.slug, n + '.json'), 'utf8'));
    const where = [...p.path, p.title].join(' · ');
    p.blocks.forEach((b, i) => {
      const text = strip(b.html) + (b.notes ? ' ' + b.notes.map(strip).join(' ') : '');
      // [page, block, location, label, text]
      shard.push([n, i, where, b.l ? `${p.unit || ''} ${b.l}`.trim() : '', text]);
      size += text.length;
      if (size > LIMIT) flush();
    });
  }
  flush();
  manifest.push({ slug: w.slug, title: w.title, files });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log('search shards:', manifest.reduce((a, m) => a + m.files.length, 0));
