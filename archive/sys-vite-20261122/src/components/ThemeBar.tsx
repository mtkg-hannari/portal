import { COLOR_THEMES, getTheme } from "../config/themes";
import { FONT_SETS, getFontSet } from "../config/fonts";

/**
 * Two independent selector rows under the header, inside the same sticky
 * wrapper: colour themes (30) and font sets (20). The two selections are
 * fully decoupled — any colour × font combination applies, and each is
 * persisted on its own. Both rows scroll horizontally so all 50 options
 * stay reachable at phone width. Each font label is rendered in its own
 * font so the sets can be compared at a glance.
 */
export function ThemeBar({
  theme,
  onThemeChange,
  font,
  onFontChange,
}: {
  theme: string;
  onThemeChange: (id: string) => void;
  font: string;
  onFontChange: (id: string) => void;
}) {
  const activeTheme = getTheme(theme);
  const activeFont = getFontSet(font);
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
        <div className="flex items-center gap-3">
          <p className="hidden w-20 shrink-0 text-[11px] font-medium tracking-[0.22em] text-[var(--dim)] md:block">
            カラー 30種
          </p>
          <div
            role="tablist"
            aria-label="カラーテーマ切替"
            className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5"
          >
            {COLOR_THEMES.map((t, i) => {
              const selected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`カラー ${i + 1}. ${t.name}`}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex shrink-0 items-center gap-2.5 border px-3 py-2 text-xs font-medium tracking-[0.06em] transition-colors ${
                    selected
                      ? "border-[var(--deep)] bg-[var(--deep)] text-white"
                      : "border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span>
                    <span className="mr-1 text-[10px] opacity-70">{i + 1}</span>
                    {t.name}
                  </span>
                  <span className="flex gap-1" aria-hidden="true">
                    {t.chips.map((c) => (
                      <span
                        key={c}
                        className="block h-2.5 w-2.5 border border-black/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-3">
          <p className="hidden w-20 shrink-0 text-[11px] font-medium tracking-[0.22em] text-[var(--dim)] md:block">
            フォント 20種
          </p>
          <div
            role="tablist"
            aria-label="フォント切替"
            className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5"
          >
            {FONT_SETS.map((f, i) => {
              const selected = f.id === font;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`フォント ${i + 1}. ${f.name}（見出し ${f.headingName}／本文 ${f.bodyName}）`}
                  onClick={() => onFontChange(f.id)}
                  style={{ fontFamily: f.headingCss }}
                  className={`shrink-0 border px-3 py-2 text-xs tracking-[0.06em] transition-colors ${
                    selected
                      ? "border-[var(--deep)] bg-[var(--deep)] text-white"
                      : "border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span className="mr-1 text-[10px] opacity-70">{i + 1}</span>
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>

        <p
          className="mt-1.5 text-[11px] leading-relaxed tracking-[0.04em] text-[var(--dim)]"
          aria-live="polite"
        >
          現在：カラー「{activeTheme.name}」／フォント「{activeFont.name}」（見出し{" "}
          {activeFont.headingName}／本文 {activeFont.bodyName}）— カラーとフォントは
          自由に組み合わせられます
        </p>
      </div>
    </div>
  );
}
