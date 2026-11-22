# dev-plan-002: Astro への移行（静的サイト生成 / さくらのレンタルサーバー運用）

作成日: 2026-11-22
対象: `portal/sys`（現状: Vite + React 19 + TypeScript + Tailwind CSS v4 の単一ページ LP）
関連: `dev-plan-001-theme.md`（デザイン確定・公開準備）、`../marketing-plan/marketing-plan.md`

## 1. 結論

**移行できます。** Astro は静的 HTML を出力する（SSG）ため、さくらのレンタルサーバーには現在と同じく「`dist/` の中身を FTP 等でアップロードする」だけで公開できます。サーバー側に Node.js・データベース・特別な設定は要りません。

- **使うもの**: Astro の静的出力（既定の `output: "static"`）
- **使わないもの**: SSR アダプタ（Node / Vercel 等）。さくらのレンタルサーバーでは動かせないため
- 現在のコンポーネント（約 1,000 行）は小さく、移行の工数は小さい

## 2. 移行する理由（メリット）

| 目的 | 現状（React SPA） | Astro 移行後 |
| --- | --- | --- |
| SEO | 初期 HTML はほぼ空で、JS 実行後に本文が出る | **各セクションが最初から HTML**として出力される。検索エンジン・SNS のプレビューに有利 |
| 表示速度 | React 全体（約 76KB gzip）を常に読み込む | 静的部分は JS 不要。**操作が必要な部分だけ JS を読み込む**（アイランド） |
| ページ追加 | 単一ページ。記事やポリシーページを作るには自前のルーティングが必要 | `src/pages/` にファイルを置くだけで**複数ページ**化（Journal 記事、プライバシーポリシー等） |
| Journal 運用 | 記事をコードに直書き | **Markdown で記事を書く**（Content Collections）。ビルドで一覧・詳細ページを自動生成 |
| 画像 | 元画像（各 0.6〜0.8MB の webp）をそのまま配信 | ビルド時に**サイズ最適化・複数解像度**を自動生成できる |
| SEO 周辺 | sitemap・OGP 等を手作業 | 公式インテグレーション（`@astrojs/sitemap`）や共通レイアウトで管理 |

マーケティング計画の中核（Journal の継続投稿、検索流入）と相性が良く、これが移行の主な動機になります。

## 3. 注意点・制約（さくらのレンタルサーバー）

| 項目 | 内容 |
| --- | --- |
| ビルド場所 | **ローカル PC（または CI）でビルドし、`dist/` をアップロード**する。さくら側ではビルドしない |
| 公開パス | ドメイン直下なら `base` 不要。サブフォルダ運用なら `astro.config` の `base` を設定する |
| URL 形式 | `build.format: "directory"`（既定）で `/journal/xxx/index.html` が出力される。Apache が `/journal/xxx/` を配信できるので問題なし。末尾スラッシュ付き URL で統一する |
| `.htaccess` | さくらは Apache。キャッシュ制御・HTTPS 強制・独自 404 は `public/.htaccess` に置けば `dist/` にコピーされる（記述は要動作確認） |
| フォーム | 静的サイトのためサーバー処理がない。現行どおり外部フォームサービスか mailto を使う。**さくらは PHP が使えるため、必要なら自作の PHP メール送信スクリプトを `public/` に置く選択肢もある**（後述の判断事項） |
| 管理画面（CMS） | 作らない。記事は Markdown ファイルを編集してビルド → アップロード |
| 運用負荷 | 更新のたびに「ビルド → アップロード」が必要（現状と同じ）。手順は README に固定化する |

## 4. 移行方針

### 4.1 構成（案）

```
sys/
├── astro.config.mjs          静的出力・Tailwind v4（@tailwindcss/vite）・React・sitemap
├── package.json
├── public/                   画像以外の静的ファイル（favicon, robots.txt, .htaccess）
└── src/
    ├── assets/images/        mco7-1〜6.webp（最適化対象）
    ├── layouts/Layout.astro  <html>・<head>（GTM・OGP・フォント）・共通レイアウト
    ├── components/
    │   ├── *.astro           Hero / Philosophy / Services / HowWeWork / Works / Journal / Company / Footer
    │   ├── Header.tsx        モバイルメニュー（状態あり）→ React アイランド
    │   ├── InquiryForm.tsx   フォーム（状態あり）→ React アイランド
    │   └── Reveal / Parallax スクロール演出 → 下記 4.2
    ├── content/journal/*.md  Journal 記事（Content Collections）
    ├── pages/
    │   ├── index.astro       トップ
    │   ├── journal/index.astro・[...slug].astro
    │   └── privacy.astro
    └── styles/global.css     現行 index.css（テーマ変数・フォント）
```

### 4.2 コンポーネント別の移行方針

| 現行 | 方針 | 理由 |
| --- | --- | --- |
| Hero / Philosophy / Services / HowWeWork / Works / Journal / Company / Footer | `.astro` に変換（静的 HTML） | `useState` 等を使っておらず、表示のみ |
| Header | React アイランドのまま（`client:load`）、または `.astro`＋小さなスクリプト | モバイルメニューの開閉に状態が必要 |
| InquiryForm | React アイランド（`client:visible`） | 入力状態・送信状態・検証があるため。現行コードを流用 |
| Reveal / ParallaxImage（`ui.tsx`） | **React を外し、Vanilla JS（IntersectionObserver / scroll）または CSS に置き換える**（`data-reveal` 属性＋共通スクリプト） | 全セクションに React を持ち込まないため。`prefers-reduced-motion` 対応も同時に行う |
| SectionHeading | `.astro` コンポーネント | 表示のみ |
| テーマ／フォント | 確定値（カラー 17 × フォント 5）の CSS 変数のみ残す。未使用テーマ・フォントは整理 | 軽量化。`ThemeBar` は削除（001 の判断事項 #1 と連動） |

### 4.3 そのまま流用できるもの

- Tailwind CSS v4 と全クラス名（`@tailwindcss/vite` を Astro の `vite.plugins` に追加）
- `index.css` のテーマ変数・フォント変数・アニメーション
- GTM（`GTM-KXK4SKRQ`）のスニペット（Layout の `<head>` と `<body>` 直後に移す）
- `config.ts` の `FORM_ENDPOINT` / `CONTACT_EMAIL`
- 文言・画像・色・フォント（見た目は変えない）

## 5. フェーズ別計画

### フェーズ0: 準備（0.5日）
- [ ] 現行 LP のスクリーンショットを撮る（デスクトップ／スマホ）。**移行後の見た目の基準にする**
- [ ] git を初期化し、移行前の状態をコミット（001 フェーズ0と共通）
- [ ] Astro プロジェクトを別ディレクトリ（例: `sys-astro/`）で新規作成し、現行 `sys/` は動作基準として残す
- [ ] Node.js のバージョン要件を確認（Astro の最新安定版の要件に合わせる）

### フェーズ1: 土台（0.5〜1日）
- [ ] `astro.config.mjs`: 静的出力、`site`（本番 URL）、`base`（必要なら）、Tailwind v4、React、sitemap
- [ ] `Layout.astro`: `lang="ja"`、`data-theme`・`data-font` の固定、GTM、メタ・OGP、フォント読込
- [ ] **フォントは使用分のみ**（M PLUS Rounded 1c）に絞り、`preconnect` と `display=swap` を指定（001 フェーズ2と統合）
- [ ] `global.css` に確定テーマの変数のみ移植
- [ ] 画像を `src/assets/` に移し、`astro:assets` の `<Image>` で配信

### フェーズ2: コンポーネント移行（1〜2日）
- [ ] 表示系コンポーネントを `.astro` へ変換（Hero → Philosophy → … の順）
- [ ] Reveal / Parallax を Vanilla JS に置換、`prefers-reduced-motion` 対応
- [ ] Header（モバイルメニュー）、InquiryForm を React アイランドとして動作確認
- [ ] アンカーリンク・スクロールオフセット（`scroll-mt-*`）を再確認
- [ ] 見た目を現行と比較（フェーズ0のスクリーンショット）

### フェーズ3: 新機能（1〜2日）
- [ ] Content Collections で Journal 記事を Markdown 化（記事一覧・詳細ページ）
- [ ] プライバシーポリシーページ（GTM／フォームの個人情報の記載を含む）
- [ ] `robots.txt`、`sitemap-index.xml`、canonical、OGP 画像
- [ ] 独自 404 ページ（`404.html`）。さくらで 404 として配信されるよう `.htaccess` で指定

### フェーズ4: 検証（0.5〜1日）
- [ ] `astro build` → `astro preview` で全ページ確認
- [ ] Lighthouse（Performance / Accessibility / SEO / Best Practices）各 90 以上
- [ ] **ステージング確認**: さくらにサブフォルダ（例: `/staging/`）を作り、`base` を変えたビルドで実機確認（任意）
- [ ] フォーム送信（正常系・異常系）、GTM のプレビューで発火確認
- [ ] リンク切れ・画像パスの確認

### フェーズ5: 公開・運用（0.5日）
- [ ] 本番ビルド → `dist/` の中身を公開フォルダへアップロード（古いハッシュ付きファイルは削除してから）
- [ ] 公開後チェック（トップ・記事・404・sitemap・OGP プレビュー・HTTPS）
- [ ] README に「記事追加 → ビルド → アップロード」の手順を記載
- [ ] 旧 `sys/`（Vite 版）はタグ付けして保管、または削除

## 6. 判断事項（2026-11-22 決定）

| # | 論点 | 決定 |
| --- | --- | --- |
| 1 | 移行のタイミング | **A. 現行 LP（Vite 版）を先に公開し、その後に移行**。現行の公開用ビルドを `release/v1-vite-dist/` に保管 |
| 2 | 既存コードの置き場所 | **`sys/` を直接入れ替える**（旧ソースは `archive/sys-vite-20261122/` に退避） |
| 3 | フォームの方式 | 外部サービス＋mailto（推奨どおり）。送信先は未設定のまま |
| 4 | アニメーション | Vanilla JS で再実装（推奨どおり） |
| 5 | 記事の形式 | Markdown（推奨どおり） |
| 6 | 公開パス | ドメイン直下（推奨どおり） |
| 7 | 自動デプロイ | まず手動（推奨どおり） |

実施結果は `result/dev-plan-002-astro-report.md` を参照。

## 7. リスクと対策

| リスク | 対策 |
| --- | --- |
| 移行で見た目が崩れる | フェーズ0のスクリーンショットと比較。Tailwind クラスはそのまま使う |
| さくらでパス・URL が崩れる | `base` / `site` を明示。ステージングのサブフォルダで事前確認 |
| 更新作業が属人化・煩雑 | 手順を README に固定。将来 CI で自動化 |
| 依存関係の更新負担 | 依存を最小限にする。年数回の更新確認を運用に入れる |
| さくらの仕様差（`.htaccess` 等） | 利用中のプランの仕様をコントロールパネルで確認してから記述 |

## 8. 完了の定義

- `astro build` が警告なしで完了し、`dist/` をさくらにアップロードして全ページが表示できる
- 現行 LP と見た目が同等（デスクトップ・スマホで目視確認）
- 初期 HTML に本文が含まれ、`view-source` で確認できる
- Journal の記事を Markdown で追加し、ビルド・アップロードで公開できる
- Lighthouse 各指標 90 以上
- README に更新手順（ビルド・アップロード）が記載されている

## 9. 工数目安

| フェーズ | 内容 | 工数 |
| --- | --- | --- |
| 0 | 準備 | 0.5日 |
| 1 | 土台 | 0.5〜1日 |
| 2 | コンポーネント移行 | 1〜2日 |
| 3 | 新機能（記事・ポリシー等） | 1〜2日 |
| 4 | 検証 | 0.5〜1日 |
| 5 | 公開・運用 | 0.5日 |

合計: 約 4〜7 日（001 のフェーズ1「フォーム送信先・会社情報」は別途必要）。
