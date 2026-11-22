import { useState } from "react";

const NAV = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "How We Work" },
  { href: "#works", label: "Works" },
  { href: "#journal", label: "Journal" },
  { href: "#company", label: "Company" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <a
          href="#top"
          className="text-lg font-bold tracking-[0.18em] text-[var(--deep)]"
          aria-label="はんなりdev トップへ"
        >
          はんなりdev
        </a>

        <nav aria-label="メインナビゲーション" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="py-2 text-[13px] font-medium tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent)]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-[var(--deep)] px-5 py-2 text-[13px] font-medium tracking-[0.14em] text-white transition-colors hover:bg-[var(--accent)]"
          >
            お問い合わせ
          </a>
        </nav>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center text-[var(--deep)] lg:hidden"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-2xl leading-none" aria-hidden="true">
            {open ? "×" : "≡"}
          </span>
        </button>
      </div>

      {open && (
        <nav
          aria-label="メインナビゲーション（モバイル）"
          className="border-t border-[var(--border)] px-5 py-3 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm font-medium tracking-[0.14em] text-[var(--text)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 block bg-[var(--deep)] px-5 py-3 text-center text-sm font-medium tracking-[0.14em] text-white"
              >
                お問い合わせ
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
