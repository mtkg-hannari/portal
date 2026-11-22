export function Footer() {
  return (
    <footer className="bg-[var(--deep)] text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-lg font-bold tracking-[0.18em]">はんなりdev</p>
          <nav aria-label="フッターナビゲーション">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] tracking-[0.12em]">
              <li><a className="py-1 hover:underline" href="#philosophy">Philosophy</a></li>
              <li><a className="py-1 hover:underline" href="#services">Services</a></li>
              <li><a className="py-1 hover:underline" href="#process">How We Work</a></li>
              <li><a className="py-1 hover:underline" href="#works">Works</a></li>
              <li><a className="py-1 hover:underline" href="#journal">Journal</a></li>
              <li><a className="py-1 hover:underline" href="#company">Company</a></li>
              <li><a className="py-1 hover:underline" href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-white/25 pt-6">
          <p className="text-xs tracking-[0.14em] text-white/70">
            はんなりdev — ソフトウェア・Web開発／ITコンサルティング
          </p>
        </div>
      </div>
    </footer>
  );
}
