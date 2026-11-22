import { ParallaxImage, Reveal, SectionHeading } from "./ui";
const img = `${import.meta.env.BASE_URL}images/mco7-4.webp`;

const STEPS = [
  {
    no: "01",
    title: "ヒアリング・要件定義",
    body: "業務の流れと困りごとを伺い、作るべきものの輪郭を文書に落とします。ここでの認識のずれをなくすことが、全体の品質を決めます。",
  },
  {
    no: "02",
    title: "設計",
    body: "画面・データ・処理の流れを設計し、レビューで認識を合わせます。建築の図面と同じく、作る前に全体像を共有します。",
  },
  {
    no: "03",
    title: "実装",
    body: "設計に沿って開発します。進捗は随時共有し、途中で気づいた点は設計に立ち返って判断します。",
  },
  {
    no: "04",
    title: "検証",
    body: "実際の業務の流れに沿って動作を確認し、公開に向けて整えます。",
  },
  {
    no: "05",
    title: "運用・保守",
    body: "公開後も、使い方の変化に合わせて手を入れ続けます。長く使う前提で設計しているからこそできる保守です。",
  },
];

export function HowWeWork() {
  return (
    <section id="process" className="mx-auto max-w-6xl scroll-mt-36 px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeading index="03" label="How We Work" title="仕事の進め方" />
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
        <Reveal className="lg:col-span-2">
          <ParallaxImage
            src={img}
            alt="建物の回廊をモチーフとしたイラスト"
            className="aspect-[4/3] w-full lg:aspect-[4/5]"
            strength={16}
          />
          <p className="mt-3 text-xs tracking-[0.08em] text-[var(--dim)]">
            回廊のイラスト。一つひとつの工程を、順序立てて丁寧に進めます。
          </p>
        </Reveal>
        <ol className="lg:col-span-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.no} delayMs={i * 60}>
              <li className="flex gap-6 border-b border-[var(--border)] py-6 first:pt-0">
                <span className="text-lg font-medium tracking-[0.15em] text-[var(--accent)]">
                  {step.no}
                </span>
                <div>
                  <h3 className="text-lg font-medium tracking-[0.1em] text-[var(--deep)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-loose text-[var(--text)]">{step.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
