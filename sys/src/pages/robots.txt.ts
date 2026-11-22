import type { APIRoute } from "astro";

// ビルド時に静的な robots.txt を生成する（Sitemap の URL は astro.config.mjs の site から）。
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("sitemap-index.xml", site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
