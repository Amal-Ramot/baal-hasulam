import type { Metadata } from 'next';
import Link from 'next/link';
import SefirotTree from '@/components/SefirotTree';
import Lexicon from '@/components/Lexicon';
import { getGlossary, type Term } from '@/lib/library';

export const metadata: Metadata = { title: 'מושגי יסוד', description: 'פירוש המלות של בעל הסולם, בלשונו, מתוך לוחות התשובות שבתלמוד עשר הספירות.' };

const CORE = ['אור', 'כלי', 'צמצום', 'מסך', 'אור ישר', 'אור חוזר', 'זווג דהכאה', 'עביות', 'דבקות', 'התפשטות', 'אור פנימי', 'אור מקיף', 'בורא', 'מאציל', 'מקום', 'זמן', 'תנועה', 'ראש'];
const SEFIROT = ['כתר', 'חכמה', 'בינה', 'זעיר אנפין', 'מלכות'];
const cite = (x: Term) => `תלמוד עשר הספירות, ${x.part}, לוח התשובות לפירוש המלות, אות ${x.l}`;

export default function Concepts() {
  const all = getGlossary();
  // first definition of a term that is an actual definition, not a cross-reference
  const pick = (t: string) => all.find((x) => x.t === t && x.d.length > 30 && !/^עי['י]|עיין מלת/.test(x.d));
  const core = CORE.map(pick).filter((x): x is Term => !!x);
  const sef = SEFIROT.map(pick).filter((x): x is Term => !!x).map((x) => ({ ...x, cite: cite(x) }));
  return (
    <div className="wrap">
      <header className="phead">
        <span className="eyebrow">פירוש המלות</span>
        <h1>מושגי יסוד</h1>
        <p className="lede">
          כל ההגדרות בעמוד זה הן לשונו של בעל הסולם עצמו, מתוך ״לוח התשובות לפירוש המלות״ שחיבר בסוף כל חלק של תלמוד עשר הספירות — {all.length.toLocaleString('he-IL')} ערכים.
        </p>
      </header>
      <section className="sec" style={{ paddingTop: 20 }}>
        <SefirotTree items={sef} />
      </section>
      <section className="sec" style={{ paddingTop: 20 }}>
        <div className="sec-head">
          <h2>מילות יסוד</h2>
          <p>ליד כל ערך — מקומו בתלמוד עשר הספירות.</p>
        </div>
        <div className="gloss">
          {core.map((x, i) => (
            <article className="term reveal" key={x.t} style={{ ['--i' as string]: i % 3 }}>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
              <cite>{cite(x)}</cite>
              <Link href={`/read/tes/${x.n}/#b${x.b}`}>
                אל המקור <span className="arrow">←</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 20 }}>
        <div className="sec-head">
          <h2>הלקסיקון המלא</h2>
          <p>חיפוש בכל ערכי פירוש המלות, מששה־עשר חלקי תלמוד עשר הספירות.</p>
        </div>
        <Lexicon />
      </section>
    </div>
  );
}
