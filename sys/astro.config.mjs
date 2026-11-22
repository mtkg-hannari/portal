// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync } from "node:fs";

// 公開URL。独自ドメインが決まったら環境変数 SITE_URL か、ここを書き換えてください。
const SITE = process.env.SITE_URL ?? "https://hannari.dev";

// Journal に公開記事（_ で始まらない .md）が1本もない間は、記事一覧ページを sitemap に含めない。
const hasJournalPosts = readdirSync(new URL("./src/content/journal/", import.meta.url)).some(
  (f) => f.endsWith(".md") && !f.startsWith("_"),
);

// さくらのレンタルサーバー向けの完全な静的サイト（SSR アダプタは使わない）。
// ドメイン直下に置く前提のため base は設定しません。
// サブフォルダに置く場合は base: "/サブフォルダ名/" を追加してください。
export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    react(),
    sitemap({
      filter: (page) => hasJournalPosts || !page.endsWith("/journal/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
