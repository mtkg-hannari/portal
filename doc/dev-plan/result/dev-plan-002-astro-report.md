# dev-plan-002 作業報告: Astro への移行

実施日: 2026-11-22
計画書: `../dev-plan-002-astro.md`
対象: `portal/sys`（Vite + React の単一ページ LP → Astro の静的サイト）

## 1. 結果の要約

**移行は完了し、ビルド・ローカル確認まで済んでいます。** さくらのレンタルサーバーへの公開は未実施です（アップロードはご自身で行う前提）。

| 項目 | 結果 |
| --- | --- |
| ビルド | `astro build` 成功。4 ページ（トップ／Journal 一覧／プライバシー／404）、`dist/` は 44 ファイル・約 4.4MB |
| 型チェック | `astro check` エラー 0・警告 0・ヒント 0 |
| 見た目 | 配色（浅葱と砂）・フォント（丸ゴシック）・画像・文言とも旧版と同じ。ブラウザで目視確認 |
| 動作 | スクロール演出 34/34 発火、モバイルメニュー開閉、アンカー移動、フォーム検証（3 項目のエラー表示）を確認 |
| スマホ幅（390px） | 横スクロールなし。メニュー開閉を確認 |
| 既知の未解決 | フォーム送信先が未設定（従来から）、`npm audit` の Astro 本体の指摘 1 件（§6） |

## 2. 決定事項（判断事項への回答）

| # | 論点 | 決定 | 実施 |
| --- | --- | --- | --- |
| 1 | タイミング | **A. 現行 LP を先に公開し、その後に移行** | 現行の公開用ビルドを `release/v1-vite-dist/` に保管（あなたが先にこれを公開する運用） |
| 2 | 置き場所 | **`sys/` を直接入れ替え** | 旧ソースを `archive/sys-vite-20261122/` に退避してから入れ替え |
| 3〜7 | その他 | 推奨どおり | フォームは外部サービス＋mailto、演出は Vanilla JS、記事は Markdown、公開は直下、デプロイは手動 |

## 3. 実施内容

### 3.1 退避（入れ替え前）

git が無いため、入れ替え前に次を退避しました。

- `archive/sys-vite-20261122/` … 旧 Vite 版のソース一式（`node_modules`・`dist` を除く）。テーマ30種・フォント20種の定義もここに残っています
- `release/v1-vite-dist/` … 旧版の公開用ビルド（GTM 組み込み済み・ビル名の注記削除済み・相対パス対応）。**決定 #1（先に現行を公開）の公開用ファイル**です。フォーム送信先は空のままなので、公開する場合は先に設定が必要です

### 3.2 新しい構成（`sys/`）

| 区分 | ファイル |
| --- | --- |
| 設定 | `astro.config.mjs`、`tsconfig.json`、`package.json`、`.gitignore` |
| ページ | `src/pages/index.astro`、`journal/index.astro`、`journal/[id].astro`、`privacy.astro`、`404.astro`、`robots.txt.ts` |
| レイアウト | `src/layouts/Layout.astro`（GTM・OGP・canonical・フォント・スクロール演出スクリプト） |
| コンポーネント | `Header`・`Footer`・`Hero`・`Philosophy`・`Services`・`HowWeWork`・`Works`・`Journal`・`Company`・`Contact`・`Reveal`・`SectionHeading`・`ParallaxImage`（すべて `.astro`）、`InquiryForm.tsx`（React） |
| 記事 | `src/content.config.ts`、`src/content/journal/_template.md` |
| スタイル | `src/styles/global.css`（確定テーマの変数のみ） |
| 公開物 | `public/.htaccess`、`public/favicon.svg`、`public/og.jpg`、`scripts/make-og.mjs` |

### 3.3 方針どおりの移行内容

- **表示だけのセクション**はすべて `.astro`（静的 HTML）に変換
- **React を残したのはお問い合わせフォームのみ**（`client:visible`＝画面に入ったとき読み込む）。ヘッダーのモバイルメニューは React を使わず小さなスクリプトで実装
- **スクロール演出・視差**は React をやめ、Layout の共通スクリプト（IntersectionObserver・スクロール）に置き換え。JavaScript が無効な環境では演出なしで全文が表示される（`html.js` クラスで制御）。`prefers-reduced-motion` にも対応
- **色・フォント**は確定した 1 組だけを `global.css` の `:root` に固定。テーマ切替・未使用フォントは削除
- **Google Fonts** は M PLUS Rounded 1c（400/500/700）のみに絞り、`preconnect`・`display=swap` を付与（旧版は 18 ファミリを一括読み込み）
- **GTM**（`GTM-KXK4SKRQ`）は `<head>` と `<body>` 直後に設置（全ページ共通）
- **アンカーのずれを修正**: 切替バー撤去後も `scroll-mt-36` が残っていたため、`html { scroll-padding-top: 5rem }` に一本化（「お問い合わせ」へ移動すると、見出しがヘッダー直下に収まることを確認）
- **画像**は `astro:assets` で、ビルド時に 4 種類の幅（640/960/1280/1600px）の webp を生成し `srcset` で配信（元は 1 枚 0.57〜0.78MB）
- 旧版で `<ol>` の直下に `<div>` を置いていた HTML の不正を、`<li>` に演出クラスを直接付ける形で解消

### 3.4 計画書の「フェーズ3 新機能」で追加したもの

- **Journal**（Markdown の記事機能）: 一覧 `/journal/`、記事ページ、トップの「最新 3 本」欄。記事は `src/content/journal/` に Markdown を置くだけ。ひな形 `_template.md`（`_` 始まりは公開されない）
- **プライバシーポリシー** `/privacy/`（フォーム・Google タグマネージャーの記載を含む）。フッターとフォーム説明文からリンク
- **404 ページ**、`robots.txt`（`site` から自動生成）、`sitemap-index.xml`／`sitemap-0.xml`、canonical、OGP・Twitter Card、`theme-color`、favicon
- **`.htaccess`**（さくら・Apache 向け）: 独自 404、圧縮、キャッシュ（`_astro/` は長期、HTML は即時反映）、`X-Content-Type-Options`・`Referrer-Policy`。すべて `IfModule` で囲み、モジュールが無効でもエラーにならない書き方。**HTTPS 転送はコメントアウト**（§5）
- **`README.md`** を全面更新（公開手順・フォーム設定・記事の書き方・構成）

## 4. 効果（旧版との比較）

測定は同じ PC のローカル（preview）で、ブラウザ上で確認した値とビルド出力です。実回線での計測（Lighthouse 等）は未実施です。

| 項目 | 旧版（Vite + React） | 新版（Astro） |
| --- | --- | --- |
| 初期 HTML | 約 1.5KB（本文は JS 実行後に生成） | 約 37KB（gzip 約 10KB）。**全セクションの本文が最初から HTML に入っている** |
| JavaScript（初回表示で必須） | 約 248KB（gzip 約 76KB）の React 一式 | 約 8KB の小さなスクリプトのみ |
| React のランタイム | 常に読み込み | **フォームが画面に入ったときだけ**（約 215KB・gzip 約 67KB） |
| CSS | 約 32KB | 約 22KB（gzip 約 5KB） |
| 画像 1 枚あたり | 0.57〜0.78MB を一律配信 | 幅に応じて 70〜310KB（`srcset`） |
| Webフォント | 18 ファミリを一括指定 | 1 ファミリ |
| ページ | 1 枚 | 4 枚（トップ・Journal・プライバシー・404）＋記事を追加可能 |

## 5. 公開前にご確認・ご対応いただくこと

1. **フォーム送信先の設定（最重要）**: `src/config.ts` の `FORM_ENDPOINT` または `CONTACT_EMAIL` が空のままです（新旧とも）。設定しないと、送信ボタンは「送信先が未設定です」と表示します。設定後に再ビルドしてください。メールアドレスをお知らせいただければ、設定して再ビルドします
2. **公開 URL の確認**: `astro.config.mjs` の `SITE` を `https://hannari.dev` と仮定しています。実際のドメインが異なる場合は書き換えて再ビルドしてください（canonical・OGP・sitemap・robots.txt に反映されます）
3. **プライバシーポリシーの内容確認**: 私が一般的な内容で作成した**たたき台**です。実際に使っているツール（GTM に入れるタグの種類）やフォーム送信サービスに合わせ、必要に応じて修正してください。連絡先は「お問い合わせフォーム」としています。**法的な確認はしていません**
4. **会社情報**（所在地・代表者・連絡先）は従来どおり未掲載です（開発計画 001 のフェーズ1）
5. **`.htaccess` は実サーバーで未検証**です。アップロード後に、トップページが表示されること、存在しない URL で 404 ページが出ることを確認してください。もし 500 エラーになる場合は、`.htaccess` を一時的に外して原因を切り分けてください。HTTPS 転送の記述（コメントアウト中）は、さくらの手順を確認して有効化してください
6. **favicon は仮のマーク**です。ロゴがあれば `public/favicon.svg` を差し替えてください。OGP 画像（`og.jpg`）は、トップのイラストを切り出した簡易版です
7. **公開前のスマホ実機確認**: 本作業ではブラウザ上で幅 390px の表示を確認しましたが、実機（iPhone / Android）での確認はしていません

## 6. 技術的な注意点・既知の問題

### 6.1 Astro のバージョン（Astro 6 系を採用）
最新の Astro 7 は Node.js 22.23.4 以上が必要ですが、この PC は 22.22.0 のため、**Astro 6.4.8**（Node 22.12 以上）を採用しました。PC の環境は変更していません。

### 6.2 `npm audit` の指摘（1 件残り）
- 解消したもの: `sharp`（0.34→0.35.5）と `esbuild`（0.27→0.28.2）は、`package.json` の `overrides` で修正版に固定しました
- **残っているもの: Astro 本体（critical・1 件）**。修正は Astro 7 のみで、Node.js の更新が必要です
- 今回のサイトの使い方への影響は小さいと判断しています。指摘は、SSR・Node アダプタ・AVIF 画像変換・MDX／JSX 描画・View Transitions・`base` の剥がし処理など、**このサイトが使わない機能**に関するものです。静的ファイルだけを出力し、さくらにはそれだけを置きます。開発サーバー（`npm run dev`）は手元で使うだけで、外部に公開しないでください
- **推奨**: Node.js を 22.23.4 以上に更新し、`npm install astro@7 @astrojs/react@latest @astrojs/sitemap@latest` で Astro 7 に上げる（別途作業）

### 6.3 ビルド時の警告
Journal の記事が 0 本の間、`No files found matching "**/[^_]*.md"` と `The collection "journal" does not exist or is empty` の警告が出ます。動作には影響せず、記事を 1 本追加すると消えます（架空の記事を入れるのは避けました）。

### 6.4 vite の版を 7 に固定
`@tailwindcss/vite` が vite 8 を持ち込み、Astro の vite 7 と衝突してビルドが失敗したため、`vite@^7` を直接の依存に追加して揃えました。Astro や Tailwind を更新する際は、vite の版が揃っているか（`npm ls vite`）を確認してください。

### 6.5 未実施の項目（計画書との差分）
| 計画書の項目 | 状況 |
| --- | --- |
| Lighthouse 各指標 90 以上 | **未計測**（ツールが使えないため）。公開後に実施をお願いします |
| さくらのサブフォルダでのステージング確認 | **未実施**（任意項目）。ドメイン直下前提で作成 |
| GTM のプレビューでの発火確認 | **未実施**（ローカルでは `gtm.js` の読み込みのみ確認）。公開後に GTM のプレビューで確認してください |
| 構造化データ（Organization） | 未実施（任意項目） |
| 旧 `sys/`（Vite 版）の扱い | `archive/` に保管（削除しない） |

## 7. 次のアクション

| # | 内容 | 担当 |
| --- | --- | --- |
| 1 | 決定 #1 に従い、現行 LP を先に公開する場合は、**フォーム送信先を設定**してから `release/v1-vite-dist/` を公開（※旧版は `src/config.ts` を再ビルドしないと変えられないため、旧ソース `archive/sys-vite-20261122/` の `src/config.ts` を編集して `npm run build` が必要） | あなた（必要なら私が対応） |
| 2 | 実際のドメインを確認し `SITE` を設定。フォーム送信先を `sys/src/config.ts` に設定 | あなた／私 |
| 3 | `npm run build` し、`sys/dist/` の中身（`.htaccess` 含む）をさくらへアップロード | あなた |
| 4 | 公開後の確認（トップ・`/privacy/`・404・sitemap・GTM プレビュー・Lighthouse） | あなた |
| 5 | プライバシーポリシーの内容確認、会社情報の追加 | あなた |
| 6 | Journal の最初の記事を 2 本（マーケティング計画のとおり）。`_template.md` をコピー | あなた（執筆の支援は可能） |
| 7 | Node.js を更新して Astro 7 へ（§6.2） | 余裕のあるとき |

## 8. 補足

- `sys/contents/` に空のフォルダがあります（私が作ったものではありません）。使っていないので、そのままにしています
- 旧版を復元したい場合: `archive/sys-vite-20261122/` を別の場所へコピーし、`npm install` → `npm run build` で旧版を再現できます
