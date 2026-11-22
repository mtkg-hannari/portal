import { ParallaxImage, Reveal } from "./ui";
const heroImg = `${import.meta.env.BASE_URL}images/mco7-1.webp`;

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-[var(--accent)]">
          Hannari Dev — Software &amp; Consulting
        </p>
        <h1 className="mt-6 max-w-3xl text-3xl font-medium leading-snug tracking-[0.08em] text-[var(--deep)] sm:text-5xl sm:leading-snug">
          建物を設計するように、
          <br />
          システムを設計する。
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-loose text-[var(--text)] sm:text-lg sm:leading-loose">
          はんなりdevは、ソフトウェア・Web開発とITコンサルティングの小さな会社です。
          要件を丁寧に読み解き、構造から考える設計で、長く使える仕組みをつくります。
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="bg-[var(--deep)] px-7 py-3 text-sm font-medium tracking-[0.14em] text-white transition-colors hover:bg-[var(--accent)]"
          >
            お問い合わせ
          </a>
          <a
            href="#services"
            className="border border-[var(--deep)] px-7 py-3 text-sm font-medium tracking-[0.14em] text-[var(--deep)] transition-colors hover:bg-[var(--surface)]"
          >
            サービスを見る
          </a>
        </div>
      </Reveal>

      <Reveal className="mt-12 sm:mt-16" delayMs={150}>
        <ParallaxImage
          src={heroImg}
          alt="建物の外観を描いたイラスト"
          className="aspect-[4/5] w-full sm:aspect-[16/10]"
          strength={26}
        />
      </Reveal>
    </section>
  );
}
