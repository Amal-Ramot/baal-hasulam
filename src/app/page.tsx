import Link from 'next/link';
import Ladder from '@/components/Ladder';
import WorkCard from '@/components/WorkCard';
import { ContinueReading, DailyPassage } from '@/components/HomeClient';
import { fmt, getFeatured, getWorks } from '@/lib/library';
import { readHref } from '@/lib/site';

export default function Home() {
  const works = getWorks();
  const pages = works.reduce((a, w) => a + w.pageCount, 0);
  const words = works.reduce((a, w) => a + w.words, 0);
  const first = (slug: string, title?: string) => {
    const w = works.find((x) => x.slug === slug)!;
    const e = title ? w.toc.find((t) => t.title === title) : w.toc[0];
    return readHref(slug, (e ?? w.toc[0]).pages[0].n);
  };
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow rise">הרב יהודה לייב הלוי אשלג · תרמ״ה–תשט״ו</span>
            <h1 className="rise" style={{ ['--i' as string]: 1 }}>
              כל תורת
              <br />
              <em>בעל הסולם</em>
            </h1>
            <p className="lede rise" style={{ ['--i' as string]: 2 }}>
              פירוש הסולם לזוהר, תלמוד עשר הספירות, ההקדמות והמאמרים — במקום אחד, בלשונם המקורית, בחוויית קריאה שנבנתה ללימוד עמוק ורציף.
            </p>
            <div className="hero-cta rise" style={{ ['--i' as string]: 3 }}>
              <Link href="/library/" className="btn btn-gold">
                אל הספרייה <span className="arrow">←</span>
              </Link>
              <Link href={first('matan-torah', 'מתן תורה')} className="btn btn-line">
                להתחיל ממתן תורה
              </Link>
            </div>
            <div className="stats rise" style={{ ['--i' as string]: 4 }}>
              <div className="stat">
                <b>{works.length}</b>
                <span>חיבורים</span>
              </div>
              <div className="stat">
                <b>{fmt(pages)}</b>
                <span>עמודי לימוד</span>
              </div>
              <div className="stat">
                <b>{fmt(Math.round(words / 1000) * 1000)}</b>
                <span>מילים, בחיפוש מלא</span>
              </div>
            </div>
          </div>
          <div className="hero-art rise" style={{ ['--i' as string]: 2 }}>
            <Ladder />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <ContinueReading />
          <div className="sec-head reveal">
            <h2>החיבורים</h2>
            <Link href="/library/" className="more">
              לספרייה המלאה <span className="arrow">←</span>
            </Link>
          </div>
          <div className="works">
            {works.map((w, i) => (
              <WorkCard key={w.slug} work={w} big={i < 2} i={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap reveal">
          <DailyPassage items={getFeatured()} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head reveal">
            <h2>מאיפה מתחילים?</h2>
            <p>שלושה מסלולים אל תוך הכתבים — מן המאמרים הפתוחים לכל אדם ועד הלימוד השיטתי.</p>
          </div>
          <div className="paths">
            <div className="path reveal">
              <h3>צעד ראשון</h3>
              <p>המאמרים שנכתבו לציבור הרחב: תכלית, ערבות ואהבת הזולת.</p>
              <ol>
                <li><Link href={first('matan-torah', 'מתן תורה')}>מתן תורה</Link></li>
                <li><Link href={first('matan-torah', 'הערבות')}>הערבות</Link></li>
                <li><Link href={first('matan-torah', 'השלום')}>השלום</Link></li>
                <li><Link href={first('matan-torah', 'מהות הדת ומטרתה')}>מהות הדת ומטרתה</Link></li>
              </ol>
            </div>
            <div className="path reveal" style={{ ['--i' as string]: 1 }}>
              <h3>שער אל החכמה</h3>
              <p>ההקדמות הבונות את השפה ואת המפה של חכמת הקבלה.</p>
              <ol>
                <li><Link href={first('hakdama-zohar')}>הקדמה לספר הזוהר</Link></li>
                <li><Link href={first('mavo-zohar')}>מבוא לספר הזוהר</Link></li>
                <li><Link href={first('peticha')}>פתיחה לחכמת הקבלה</Link></li>
                <li><Link href={first('tes')}>הקדמה לתלמוד עשר הספירות</Link></li>
              </ol>
            </div>
            <div className="path reveal" style={{ ['--i' as string]: 2 }}>
              <h3>לימוד שיטתי</h3>
              <p>החיבורים הגדולים, לפי הסדר — עם אור פנימי ולוחות חזרה.</p>
              <ol>
                <li><Link href="/work/tes/">תלמוד עשר הספירות</Link></li>
                <li><Link href={first('peticha-sulam')}>פתיחה לפירוש הסולם</Link></li>
                <li><Link href="/work/zohar-sulam/">הזוהר עם פירוש הסולם</Link></li>
                <li><Link href="/concepts/">מילון מושגי היסוד</Link></li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
