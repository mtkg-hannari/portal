import { Reveal, SectionHeading } from "./ui";

const ROWS = [
  { term: "会社名", value: "はんなりdev" },
  {
    term: "事業内容",
    value: "ソフトウェア・Web開発、ITコンサルティング",
  },
  {
    term: "お問い合わせ",
    value: "本ページのお問い合わせフォームよりご連絡ください",
  },
];

export function Company() {
  return (
    <section id="company" className="scroll-mt-36 bg-[var(--surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading index="06" label="Company" title="会社について" />
        <Reveal>
          <dl className="mt-10 max-w-3xl">
            {ROWS.map((row) => (
              <div
                key={row.term}
                className="grid gap-1 border-b border-[var(--border)] py-5 sm:grid-cols-[180px_1fr] sm:gap-6"
              >
                <dt className="text-sm font-medium tracking-[0.14em] text-[var(--dim)]">
                  {row.term}
                </dt>
                <dd className="leading-relaxed text-[var(--text)]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-3xl text-sm leading-loose text-[var(--dim)]">
            所在地・連絡先などの詳細は、お問い合わせいただいた際にご案内します。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
