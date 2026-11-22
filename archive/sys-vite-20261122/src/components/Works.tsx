import { ParallaxImage, Reveal, SectionHeading } from "./ui";
const detailA = `${import.meta.env.BASE_URL}images/mco7-5.webp`;
const detailB = `${import.meta.env.BASE_URL}images/mco7-6.webp`;

const FIELDS = [
  {
    title: "業務システム",
    body: "受発注・在庫・顧客管理など、日々の業務を支えるシステムの設計・開発を行う分野です。",
  },
  {
    title: "Webサービス",
    body: "ブラウザで使うサービスの企画・設計・開発を行う分野です。小さく始めて育てる進め方を得意とします。",
  },
  {
    title: "Webサイト",
    body: "企業サイトやランディングページの制作と、その後の運用・改善を行う分野です。",
  },
  {
    title: "ITコンサルティング",
    body: "要件定義や技術選定など、開発の前段にある計画づくりを支援する分野です。",
  },
];

export function Works() {
  return (
    <section id="works" className="scroll-mt-36 bg-[var(--surface-alt)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading index="04" label="Works" title="仕事の分野" />
        <Reveal>
          <p className="mt-8 max-w-2xl leading-loose text-[var(--text)]">
            取り組んでいる仕事を、分野ごとにご紹介します。
            個別の導入事例や顧客名は掲載していません。具体的なご相談は、お問い合わせフォームからお寄せください。
          </p>
        </Reveal>
        <div className="mt-10 grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {FIELDS.map((field, i) => (
            <Reveal key={field.title} delayMs={i * 60} className="bg-[var(--surface)]">
              <div className="h-full px-7 py-8">
                <h3 className="text-lg font-medium tracking-[0.1em] text-[var(--deep)]">
                  {field.title}
                </h3>
                <p className="mt-3 leading-loose text-[var(--text)]">{field.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Reveal>
            <ParallaxImage
              src={detailA}
              alt="建物のガラスと石材のディテールを描いたイラスト"
              className="aspect-[16/10] w-full"
              strength={14}
            />
            <p className="mt-3 text-xs tracking-[0.08em] text-[var(--dim)]">
              ディテールのイラスト（1）。素材の組み合わせのように、技術の組み合わせにも意図を持ちます。
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <ParallaxImage
              src={detailB}
              alt="建物の手すりのディテールを描いたイラスト"
              className="aspect-[16/10] w-full"
              strength={14}
            />
            <p className="mt-3 text-xs tracking-[0.08em] text-[var(--dim)]">
              ディテールのイラスト（2）。手に触れる部分の仕上がりが、全体の印象を決めます。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
