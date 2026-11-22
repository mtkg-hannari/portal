import { Reveal, SectionHeading } from "./ui";

const THEMES = [
  {
    label: "Design",
    title: "設計の話",
    body: "要件定義や画面設計、構造の考え方など、ものづくりの前段で考えていることを書きます。",
  },
  {
    label: "Technology",
    title: "技術の話",
    body: "開発で使う技術や道具について、実際に検証したことや選定の理由をまとめます。",
  },
  {
    label: "Work",
    title: "仕事の話",
    body: "小さな会社の開発の進め方や、案件を通じて学んだことを記録します。",
  },
];

export function Journal() {
  return (
    <section id="journal" className="mx-auto max-w-6xl scroll-mt-36 px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeading index="05" label="Journal" title="ジャーナル" />
      <Reveal>
        <p className="mt-8 max-w-2xl leading-loose text-[var(--text)]">
          日々の仕事で考えたことを書き留める場所です。記事は順次公開していきます。
          ここでは、扱うテーマをご紹介します。
        </p>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {THEMES.map((theme, i) => (
          <Reveal key={theme.label} delayMs={i * 80}>
            <article className="h-full border border-[var(--border)] bg-[var(--surface)] px-7 py-8">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
                {theme.label}
              </p>
              <h3 className="mt-3 text-lg font-medium tracking-[0.1em] text-[var(--deep)]">
                {theme.title}
              </h3>
              <p className="mt-3 leading-loose text-[var(--text)]">{theme.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
