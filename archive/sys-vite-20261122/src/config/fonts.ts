// Font sets (20) — typography ONLY, independent of the colour themes
// (see themes.ts): any font set can be combined with any colour theme.
// The font selector switches the `data-font` attribute on <html>; the
// actual font stacks live in theme.css as `[data-font="<id>"]` blocks
// setting --font-heading / --font-body / --ls-body. The headingCss /
// bodyCss strings below mirror those stacks and are used to render each
// selector label in its own font.
//
// To add a font set: append an entry here AND a matching
// `[data-font="<id>"] { … }` block in theme.css (and extend the Google
// Fonts @import at the top of theme.css if it uses a new family).

export interface FontSet {
  id: string;
  /** Short standalone name shown in the selector. */
  name: string;
  /** Display name of the heading font. */
  headingName: string;
  /** Display name of the body font. */
  bodyName: string;
  /** CSS font-family stack for headings (mirrors theme.css). */
  headingCss: string;
  /** CSS font-family stack for body text (mirrors theme.css). */
  bodyCss: string;
}

const GOTHIC =
  '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", sans-serif';
const MINCHO =
  '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';

export const FONT_SETS: FontSet[] = [
  { id: "tansei-gothic", name: "端正ゴシック", headingName: "Noto Sans JP", bodyName: "Noto Sans JP", headingCss: GOTHIC, bodyCss: GOTHIC },
  { id: "shippori-mincho", name: "しっぽり明朝", headingName: "Shippori Mincho", bodyName: "Noto Sans JP", headingCss: `"Shippori Mincho", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "zen-old-mincho", name: "Zen Old Mincho", headingName: "Zen Old Mincho", bodyName: "Noto Sans JP", headingCss: `"Zen Old Mincho", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "serif-classic", name: "Serifクラシック", headingName: "Noto Serif JP", bodyName: "Noto Sans JP", headingCss: `"Noto Serif JP", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "maru-gothic", name: "丸ゴシック", headingName: "M PLUS Rounded 1c", bodyName: "M PLUS Rounded 1c", headingCss: '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif', bodyCss: '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif' },
  { id: "zen-kaku", name: "Zen Kaku", headingName: "Zen Kaku Gothic New", bodyName: "Noto Sans JP", headingCss: '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif', bodyCss: GOTHIC },
  { id: "sawarabi-gothic", name: "さわらびゴシック", headingName: "Sawarabi Gothic", bodyName: "Sawarabi Gothic", headingCss: '"Sawarabi Gothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif', bodyCss: '"Sawarabi Gothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif' },
  { id: "shippori-b1", name: "しっぽり明朝B1", headingName: "Shippori Mincho B1", bodyName: "Noto Serif JP", headingCss: `"Shippori Mincho B1", "Shippori Mincho", ${MINCHO}`, bodyCss: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' },
  { id: "kosugi-gothic", name: "小杉ゴシック", headingName: "Kosugi", bodyName: "Noto Sans JP", headingCss: '"Kosugi", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif', bodyCss: GOTHIC },
  { id: "kaisei-decol", name: "Kaisei Decol", headingName: "Kaisei Decol", bodyName: "Noto Sans JP", headingCss: `"Kaisei Decol", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "kiwi-maru", name: "Kiwi Maru", headingName: "Kiwi Maru", bodyName: "M PLUS Rounded 1c", headingCss: '"Kiwi Maru", "Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", sans-serif', bodyCss: '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif' },
  { id: "zen-kaku-bold", name: "Zen Kaku太字", headingName: "Zen Kaku Gothic New", bodyName: "Zen Kaku Gothic New", headingCss: '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif', bodyCss: '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif' },
  { id: "zen-maru", name: "Zen Maru", headingName: "Zen Maru Gothic", bodyName: "Zen Maru Gothic", headingCss: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif', bodyCss: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif' },
  { id: "sawarabi-mincho", name: "さわらび明朝", headingName: "Sawarabi Mincho", bodyName: "Noto Serif JP", headingCss: `"Sawarabi Mincho", ${MINCHO}`, bodyCss: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' },
  { id: "shippori-light", name: "しっぽり明朝Light", headingName: "Shippori Mincho", bodyName: "Noto Sans JP", headingCss: `"Shippori Mincho", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "fude-moji", name: "筆文字", headingName: "Yuji Syuku", bodyName: "Noto Sans JP", headingCss: `"Yuji Syuku", "Kaisei Decol", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "kaisei-opti", name: "Kaisei Opti", headingName: "Kaisei Opti", bodyName: "Noto Sans JP", headingCss: `"Kaisei Opti", ${MINCHO}`, bodyCss: GOTHIC },
  { id: "hina-mincho", name: "ひな明朝", headingName: "Hina Mincho", bodyName: "Noto Serif JP", headingCss: `"Hina Mincho", ${MINCHO}`, bodyCss: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' },
  { id: "murecho", name: "Murecho", headingName: "Murecho", bodyName: "Murecho", headingCss: '"Murecho", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif', bodyCss: '"Murecho", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif' },
  { id: "shippori-antique", name: "しっぽりアンティーク", headingName: "Shippori Antique", bodyName: "Noto Sans JP", headingCss: `"Shippori Antique", "Shippori Mincho", ${MINCHO}`, bodyCss: GOTHIC },
];

export const DEFAULT_FONT_ID = "maru-gothic";
export const FONT_STORAGE_KEY = "hannaridev-lp-font";

export function isFontId(value: string | null): value is string {
  return value !== null && FONT_SETS.some((f) => f.id === value);
}

export function getFontSet(id: string): FontSet {
  return FONT_SETS.find((f) => f.id === id) ?? FONT_SETS[0]!;
}
