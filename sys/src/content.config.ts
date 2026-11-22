import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Journal 記事。src/content/journal/ に Markdown を置くと、ビルド時に
// 一覧（/journal/）と詳細（/journal/<ファイル名>/）が自動生成されます。
// ファイル名が _ で始まるもの（_template.md）は公開されません。
const journal = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/journal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(["Design", "Technology", "Work"]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal };
