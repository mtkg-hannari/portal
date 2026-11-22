# CLAUDE.md

## Working rules (highest priority)

- **Never change code or files, run `git commit`, or run `git push` until the user explicitly orders it.**
  - This covers editing, creating, deleting, or renaming any file in this repo (including formatting and dependency changes).
  - Until told otherwise, only read, investigate, explain, and propose changes. Show a proposed diff or plan in chat and wait.
  - An order for one action does not carry over to the next. For example, "edit X" does not mean "commit it", and "commit" does not mean "push". Wait for each order.
  - The only exception is creating or updating this `CLAUDE.md` when asked.
- Reply to the user in the language they write in (they write in English and Japanese).

## Project overview

はんなりdev portal: a landing page built with **Astro** and output as fully static files (HTML, CSS, JS, images). No server-side code or database. It is uploaded as-is to a Sakura rental server.

- Remote: https://github.com/mtkg-hannari/portal.git (branch `main`)
- Public URL is `SITE` in `sys/astro.config.mjs` (default `https://hannari.dev`, also settable with the `SITE_URL` env var).
- Pages: top page, Journal (article list and article pages), privacy policy, 404.
- Analytics: Google Tag Manager `GTM-KXK4SKRQ`, set in `sys/src/layouts/Layout.astro`.
- Design: color "浅葱と砂" with the M PLUS Rounded 1c font (decided).

## Repo layout

| Path | Contents |
| --- | --- |
| `sys/` | The Astro app (source of truth). Run all npm commands here. |
| `sys/src/` | `components`, `layouts`, `pages`, `content`, `assets`, `styles`, `config.ts`, `content.config.ts` |
| `sys/public/` | Static assets copied as-is (including `.htaccess`) |
| `sys/scripts/make-og.mjs` | Generates the OGP image (`public/og.jpg`) |
| `doc/` | Documents: `articles`, `dev-plan`, `marketing-plan`, `runbook` |
| `release/` | Build outputs for publishing (`v1-vite-dist`) |
| `archive/` | Old Vite + React version (`sys-vite-20261122`) |

`sys/node_modules`, `sys/dist`, and `sys/.astro` are git-ignored.

## Commands (run in `sys/`)

Requires Node.js >= 22.12.0 and npm.

```bash
npm install      # first time only
npm run dev      # dev server at http://localhost:4321/
npm run build    # production build -> dist/
npm run preview  # preview the build locally
npm run check    # type check (Astro / TypeScript)
npm run og       # regenerate public/og.jpg
```

## Deployment notes

- Upload the **contents** of `dist/` (not the folder itself) to the public folder on the server, including the dotfile `.htaccess`.
- `_astro/` file names change on every build. Delete the old `_astro/` before uploading.
- The site assumes it sits at the domain root. For a subfolder, set `base` in `astro.config.mjs` and adjust `ErrorDocument` in `public/.htaccess`.
- See `sys/README.md` for details, including the contact form destination setup.

## Stack

Astro 6, React 19 (`@astrojs/react`), Tailwind CSS 4 (`@tailwindcss/vite`), TypeScript, `@astrojs/sitemap`.
