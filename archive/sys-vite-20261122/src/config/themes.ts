// Colour themes (30) — colours ONLY. All 30 redone 2026-11-20 toward a
// fresh (さわやか) and healthy (健康的) register: light grounds, fresh
// greens / sky blues / citrus / soft coral accents. Sumi ink stays in
// every theme as the structural colour (footer, dark bands, body text,
// headings via --deep/--text), so contrast stays high throughout. Fonts are a separate, independent
// selection (see fonts.ts): any colour theme can be combined with any
// font set. The tab bar switches the `data-theme` attribute on <html>;
// the actual palettes live in theme.css as CSS variable overrides per
// theme id. The mco-7 illustrations are never recoloured — only the site
// UI (backgrounds, text, accents, borders, buttons, form) changes.
//
// To add a theme: append an entry here AND a matching
// `[data-theme="<id>"] { … }` block in theme.css.

export interface ColorTheme {
  id: string;
  name: string;
  /** Representative palette colours shown as chips in the tab. */
  chips: string[];
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: "turquoise", name: "ターコイズと若葉", chips: ["#F2F8F3", "#35C4B5", "#177A74", "#1E2B24", "#232620"] },
  { id: "ai-renga", name: "空と若芽", chips: ["#F3F8F7", "#5BA8D9", "#256D85", "#202A30", "#242A26"] },
  { id: "shinchuu-sumi", name: "柑橘と月白", chips: ["#FDF8EC", "#F2B705", "#8A6410", "#26241F", "#26241F"] },
  { id: "budou-tetsu", name: "珊瑚と白磁", chips: ["#FFF6F1", "#FF8A75", "#B44A32", "#2A2320", "#2B2522"] },
  { id: "wakatake-geppaku", name: "若竹と月白", chips: ["#F4F9F2", "#7FB069", "#2E7D5B", "#222B20", "#263028"] },
  { id: "gunjou-kincha", name: "空と山吹", chips: ["#F4F8FB", "#F0B429", "#2C5F8A", "#1F272E", "#222A30"] },
  { id: "asagi-hakuji", name: "浅葱と白磁", chips: ["#F2F8F8", "#63B3AC", "#1E7A6E", "#1E2A28", "#22302E"] },
  { id: "suou-ama", name: "杏と白磁", chips: ["#FFF8F0", "#F5A65B", "#A8541A", "#28211B", "#2E2822"] },
  { id: "koke-ishidatami", name: "若草と白磁", chips: ["#F5F8EE", "#A8C686", "#56702C", "#222A1C", "#252B20"] },
  { id: "yuukage-yamabuki", name: "藤と空", chips: ["#F5F6FA", "#A8B8E8", "#4F6396", "#23262E", "#262A32"] },
  { id: "sango-shinju", name: "珊瑚と真珠", chips: ["#FFF7F2", "#FF9A85", "#B44A32", "#2B211E", "#2E2622"] },
  { id: "tetsukon-ginnezu", name: "白磁と空", chips: ["#F4F8FA", "#7FB8C9", "#2B6B7A", "#20262A", "#21282C"] },
  { id: "anzu-wakame", name: "杏と若芽", chips: ["#FFFBF0", "#93B45E", "#A85E1A", "#26231C", "#2C2820"] },
  { id: "kurotsurubami-ama", name: "若芽と月白", chips: ["#F6F9F0", "#A8C686", "#4A7A3A", "#23261E", "#252A20"] },
  { id: "fuji-tsukikage", name: "藤と白磁", chips: ["#F7F5FB", "#B8A6E0", "#6B4FA1", "#25232C", "#282630"] },
  { id: "yukishiro-hi", name: "雪白と珊瑚", chips: ["#FEFDFB", "#FF8A75", "#C04A32", "#26241F", "#26221E"] },
  { id: "fukagawa-suna", name: "浅葱と砂", chips: ["#F3F7F3", "#63B3AC", "#1E6B5E", "#202A24", "#232B26"] },
  { id: "akane-tetsu", name: "桃と月白", chips: ["#FFF6F3", "#F0836A", "#A63A32", "#28211F", "#2B2422"] },
  { id: "wakanae-sora", name: "若苗と空", chips: ["#F4FAF2", "#5BA8D9", "#1E7A6B", "#202B22", "#243028"] },
  { id: "sumi-kindei", name: "山吹と白磁", chips: ["#FDF9EC", "#F2C230", "#8A6410", "#26241F", "#262219"] },
  { id: "sumi-gin", name: "墨と白磁", chips: ["#F7F8F7", "#9AB8B0", "#4A5A56", "#262624", "#1F1F1D"] },
  { id: "sumi-gunjou", name: "墨と空", chips: ["#F2F7FA", "#5BA8D9", "#2C5F8A", "#22282E", "#20262A"] },
  { id: "sumi-wakame", name: "墨と若芽", chips: ["#F4F8EC", "#A8C686", "#56702C", "#232A1C", "#23261E"] },
  { id: "sumi-yamabuki", name: "墨と柑橘", chips: ["#FDF8E8", "#F5B81E", "#8A6410", "#26241C", "#262219"] },
  { id: "sumi-fuji", name: "墨と藤", chips: ["#F6F4FA", "#B8A6E0", "#62488F", "#252230", "#26232C"] },
  { id: "sumi-sango", name: "墨と珊瑚", chips: ["#FFF6F1", "#FF8A75", "#B0492F", "#2A2320", "#28231F"] },
  { id: "sumi-hakuji", name: "墨とミント", chips: ["#F2F9F5", "#5EC9A0", "#1E7A5E", "#202A24", "#212A26"] },
  { id: "sumi-koke", name: "墨と若草", chips: ["#F5F8EE", "#A8C686", "#5A7A2F", "#232A1C", "#23261F"] },
  { id: "sumi-akane", name: "墨と桃", chips: ["#FFF6F3", "#F59A85", "#A63E32", "#28211F", "#27211F"] },
  { id: "sumi-asagi", name: "墨と浅葱", chips: ["#F0F7F7", "#63B3AC", "#207A72", "#1F2E2C", "#21282A"] },
];

export const DEFAULT_THEME_ID = "fukagawa-suna";
export const THEME_STORAGE_KEY = "hannaridev-lp-theme";

export function isThemeId(value: string | null): value is string {
  return value !== null && COLOR_THEMES.some((t) => t.id === value);
}

export function getTheme(id: string): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES[0]!;
}
