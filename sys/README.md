# はんなりdev ポータル（Astro / 静的サイト）

はんなりdev のランディングページです。**Astro** で書き、ビルドすると**完全な静的ファイル**（HTML・CSS・JS・画像）になります。サーバー側のプログラムやデータベースは不要で、さくらのレンタルサーバーにそのままアップロードできます。

- デザイン: カラー「浅葱と砂」× フォント「丸ゴシック（M PLUS Rounded 1c）」で確定
- 構成: トップページ／Journal（記事一覧・記事ページ）／プライバシーポリシー／404 ページ
- 計測: Google タグマネージャー（`GTM-KXK4SKRQ`）を `src/layouts/Layout.astro` に設置済み
- 旧版（Vite + React 版）は `../archive/sys-vite-20261122/`、公開用ビルドは `../release/v1-vite-dist/` に保管しています

## 必要なもの

Node.js 22.12 以上と npm。

## コマンド

```bash
npm install        # 初回だけ。依存パッケージを入れる
npm run dev        # 開発サーバー（http://localhost:4321/）
npm run build      # 本番ビルド → dist/ に出力
npm run preview    # ビルド結果をローカルで確認（http://localhost:4321/）
npm run check      # 型チェック（Astro / TypeScript）
npm run og         # OGP画像（public/og.jpg）をトップのイラストから作り直す
```

## さくらのレンタルサーバーへの公開手順

1. `npm run build` を実行します。
2. 生成された **`dist/` フォルダの中身**（`index.html`・`_astro/`・`journal/`・`privacy/`・`404.html`・`robots.txt`・`sitemap-*.xml`・`.htaccess` など）を、公開フォルダ（通常は `www`。独自ドメインならそのドメイン用のフォルダ）へアップロードします。
   - `dist` フォルダ自体ではなく、**中身**を置いてください。
   - **`.htaccess`（ドットで始まるファイル）も忘れずに**アップロードしてください。ファイルマネージャや FTP ソフトの設定で「隠しファイルを表示」にしないと見えないことがあります。
3. 更新のたびに `_astro/` 内のファイル名が変わります。**古い `_astro/` フォルダを削除してから**上げ直すと、不要なファイルが残りません（アップロード中の数十秒は表示が崩れる可能性があるため、アクセスの少ない時間帯が安全です）。
4. 公開後、トップ・`/privacy/`・存在しない URL（404 ページ）・`/sitemap-index.xml` を確認します。

### 公開URLとフォルダの設定

- 公開 URL は `astro.config.mjs` の `SITE`（既定: `https://hannari.dev`）です。**実際のドメインと違う場合は書き換えて**から再ビルドしてください（canonical・OGP・sitemap・robots.txt に使われます）。環境変数 `SITE_URL` でも指定できます。
- **ドメイン直下**に置く前提です。サブフォルダ（例: `www/portal/`）に置く場合は、`astro.config.mjs` の `defineConfig` に `base: "/portal/"` を追加し、`public/.htaccess` の `ErrorDocument` のパスも合わせてください。
- HTTPS への自動転送は `public/.htaccess` の末尾にコメントアウトして用意してあります。SSL の設定後に、動作を確認しながら有効化してください。

## お問い合わせフォームの送信先設定（重要）

静的サイトなので、送信先はご自身で用意する必要があります。`src/config.ts` の2つの定数で設定します。

| 定数 | 意味 |
| --- | --- |
| `FORM_ENDPOINT` | フォーム内容を JSON で POST する先の URL（Formspree、Basin など）。 |
| `CONTACT_EMAIL` | `FORM_ENDPOINT` が空のときのフォールバック。設定すると、送信ボタンでメールソフトが開き、入力内容が本文に入ります。 |

送信される JSON の形式:

```json
{
  "name": "お名前",
  "email": "メールアドレス",
  "company": "会社名・団体名（任意）",
  "topic": "software | consulting | other",
  "message": "お問い合わせ内容"
}
```

**両方とも空のまま公開すると、フォームは「送信先が未設定です」という案内を表示します。** 公開前に必ずどちらかを設定し、設定後は再ビルドしてください。

## Journal（記事）の書き方

記事は Markdown ファイルです。管理画面はありません。

1. `src/content/journal/_template.md` をコピーし、`記事の英数字名.md`（例: `what-is-requirements-definition.md`）として同じフォルダに保存します。ファイル名がそのまま URL（`/journal/記事の英数字名/`）になります。
2. 先頭の設定（タイトル・要約・日付・カテゴリ）を書き換え、本文を書きます。
3. 公開する準備ができたら `draft: false` にします（`true` の間はビルドに含まれません）。
4. `npm run build` → `dist/` をアップロード。トップページの Journal 欄（最新3本）、`/journal/`（一覧）、記事ページ、sitemap が自動で更新されます。

記事が1本もない間は、ビルド時に「No files found」という警告が出ますが、問題ありません（記事を追加すると出なくなります）。`_` で始まるファイルは公開されません。

## 構成

```
.
├── astro.config.mjs        Astro 設定（静的出力・Tailwind・React・sitemap）
├── package.json
├── public/                 そのまま dist/ にコピーされるファイル
│   ├── .htaccess           さくら（Apache）向け: 404・圧縮・キャッシュ・ヘッダー
│   ├── favicon.svg         仮のアイコン（差し替え可）
│   └── og.jpg              SNS共有用の画像（npm run og で再生成）
├── scripts/make-og.mjs     OGP画像の生成
└── src/
    ├── assets/images/      イラスト mco7-1〜6.webp（ビルド時に最適化される）
    ├── config.ts           フォーム送信先の設定
    ├── content.config.ts   Journal 記事の項目定義
    ├── content/journal/    Journal 記事（Markdown）
    ├── layouts/Layout.astro  共通の <head>（GTM・OGP・フォント）・ヘッダー・フッター・スクロール演出
    ├── components/         各セクション（.astro）／お問い合わせフォーム（InquiryForm.tsx のみ React）
    ├── pages/              index / journal / privacy / 404 / robots.txt
    └── styles/global.css   デザイン（色・フォント・タイポグラフィ・演出）
```

- 静的な部分は JavaScript なしの HTML です。JS を読み込むのは、お問い合わせフォーム（画面に入ったとき）とスクロール演出・メニューの小さなスクリプトだけです。
- 色・フォントは `src/styles/global.css` 冒頭の `:root` で定義しています。

## イラストについて

`src/assets/images/` のイラスト6点（mco7-1〜6）は、建築をモチーフとしたデザイン素材です。
