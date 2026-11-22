import { ParallaxImage, Reveal, SectionHeading } from "./ui";
const img = `${import.meta.env.BASE_URL}images/mco7-2.webp`;

export function Philosophy() {
  return (
    <section id="philosophy" className="mx-auto max-w-6xl scroll-mt-36 px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeading index="01" label="Philosophy" title="設計の思想" />
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="space-y-6 text-base leading-loose text-[var(--text)]">
            <p>
              いい建物は、見た目より前に「使われ方」から考えられています。
              人の流れ、光の入り方、荷重のかかり方、そして十年先にどう使われるか。
              私たちは、システム開発もまったく同じ順序で考えるべきだと思っています。
            </p>
            <p>
              画面の美しさの前に、誰が・いつ・何のために使うのか。
              はんなりdevは要件定義を設計の中心に置き、無理のない構造で、
              長く手を入れ続けられる仕組みをつくります。
              建築でいう設計力こそ、ITの計画と開発にいちばん効く力だと考えているからです。
            </p>
            <p>
              小さな会社だからこそ、一つの案件に設計者として深く関わり続けます。
              相談の段階から公開後の保守まで、同じ目で見続けることが、
              仕組みを「建てて終わり」にしないための私たちの約束です。
            </p>
          </div>
        </Reveal>
        <Reveal delayMs={120}>
          <ParallaxImage
            src={img}
            alt="建物の外観に寄った構図のイラスト"
            className="aspect-[4/3] w-full lg:aspect-[5/4]"
            strength={18}
          />
          <p className="mt-3 text-xs tracking-[0.08em] text-[var(--dim)]">
            外観に寄った一枚。細部まで意図を持って設計された建築のように、仕組みも細部から考えます。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
