# はんなりdev LP

はんなりdev のランディングページの、完全な React プロジェクト一式です。
Vite + React + TypeScript + Tailwind CSS v4 で構成され、**完全に静的なサイト**としてビルドできます。Muse のバックエンドへの依存はありません。

## セットアップとビルド

前提: Node.js 18 以上（推奨 20 以上）と npm がインストールされていること。

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 本番ビルド（dist/ に静的ファイルが出力されます）
npm run build

# 3. （任意）ローカルでプレビュー
npm run preview
```

開発中は次で開発サーバーが起動します。

```bash
npm run dev
```

## デプロイ

`npm run build` で生成された **`dist/` フォルダの中身を、そのまま任意の静的ホスティングへアップロード**してください。サーバー側のプログラムは不要です。

- 例: Netlify / Vercel / Cloudflare Pages（ビルドコマンド `npm run build`、出力ディレクトリ `dist` を指定するだけでも可）
- レンタルサーバーの公開フォルダへ FTP 等でアップロード
- GitHub Pages、S3 + CloudFront など
- **さくらのレンタルサーバー**: ファイルマネージャまたは FTP で、`dist/` の**中身**（`index.html`・`assets/`・`images/`）を公開フォルダ（通常は `www`、独自ドメインならそのドメイン用フォルダ）へアップロードします。`dist` フォルダ自体ではなく中身を置いてください。ビルドは相対パス（`vite.config.ts` の `base: "./"`）なので、ドメイン直下でも `www/portal/` のようなサブフォルダでも動作します。更新時は `assets/` 内のファイル名が変わるため、古い `assets/` は削除してから上げ直すと確実です。

`public/` フォルダの内容（イラスト画像など）は、ビルド時に `dist/` へそのままコピーされます。

## 現在の確定デザイン

**カラーテーマ 17「浅葱と砂」× フォント 5「丸ゴシック」（M PLUS Rounded 1c）で確定**しています。ヘッダー下のテーマ／フォント切替バー（`ThemeBar`）は画面から外しており、`index.html` の `<html data-theme="fukagawa-suna" data-font="maru-gothic">` と `App.tsx` が固定で適用します。他のテーマ・フォントの定義（`src/config/`・`src/index.css`）は残してあるので、別の組み合わせに変える場合は `DEFAULT_THEME_ID`／`DEFAULT_FONT_ID` と `index.html` の属性を書き換えてください（切替バーを戻す場合は `App.tsx` に `ThemeBar` を再度組み込みます）。

## カラーテーマ30種 × フォント20種（独立切替・自由な組み合わせ）

> 2026-11-20：全30テーマを「さわやか・健康的」なイメージに作り直しました。地色は白〜淡いミント／空色／生成りの明るいトーン、アクセントは若芽・若竹・ミント・若草の緑、空・浅葱の青、山吹・柑橘・杏の柑橘色、柔らかな珊瑚・桃に統一。フッターなど濃色の構造部と本文は、好評だった**墨**を全テーマで維持しています（本文×地色のコントラストは全テーマ12.8:1以上）。

ヘッダー直下に2段のセレクターがあります。**上段＝カラーテーマ30種、下段＝フォント20種**で、両者は完全に独立しています。カラーを変えてもフォントは変わらず、フォントを変えてもカラーは変わりません（全600通りの組み合わせが可能です）。切り替えは即時反映され、選択はそれぞれ別々にブラウザの `localStorage` に保存されます（キー: カラー `hannaridev-lp-theme`／フォント `hannaridev-lp-font`）。セレクター下のキャプションに、現在のカラー名とフォント名が表示されます。**変わるのは UI の配色とタイポグラフィのみで、イラスト画像そのものは変更されません。**

### カラーテーマ（30種）

| # | テーマ | 概要 |
| --- | --- | --- |
| 1 | ターコイズと若葉 | 既定。淡いミントの地／ターコイズ／若葉の鮮やかアクセント。構造色は墨 |
| 2 | 空と若芽 | 淡い水色の地／空色／若芽グリーン |
| 3 | 柑橘と月白 | 月白の地／柑橘（山吹系）のアクセント |
| 4 | 珊瑚と白磁 | 白磁の地／柔らかな珊瑚（旧・葡萄酒の重い配色を明るく作り直し） |
| 5 | 若竹と月白 | 若竹グリーン／月白、明るく軽い |
| 6 | 空と山吹 | 空色／山吹の鮮やかアクセント／温かみのある白 |
| 7 | 浅葱と白磁 | 浅葱グリーン／白磁ホワイト、軽く清潔 |
| 8 | 杏と白磁 | 白磁の地／杏アプリコットのアクセント |
| 9 | 若草と白磁 | 白磁の地／若草グリーン |
| 10 | 藤と空 | 淡い藤色／空色、軽やか（旧・夕影の暗い配色を作り直し） |
| 11 | 珊瑚と真珠 | 珊瑚／真珠ホワイト、柔らかく爽やか |
| 12 | 白磁と空 | 白磁ホワイト／澄んだ空色、爽やかで軽い（旧・鉄紺の重い配色を作り直し） |
| 13 | 杏と若芽 | 杏アプリコット／若芽グリーン、爽やかで軽い |
| 14 | 若芽と月白 | 月白の地／若芽グリーン（旧・黒橡の重い配色を作り直し） |
| 15 | 藤と白磁 | 白磁の地／淡い藤色 |
| 16 | 雪白と珊瑚 | 雪白の地に珊瑚のアクセント（旧・緋を柔らかく） |
| 17 | 浅葱と砂 | 淡い浅葱／砂色の帯、川辺のような爽やかさ |
| 18 | 桃と月白 | 月白の地／柔らかな桃色（旧・茜と鉄を作り直し） |
| 19 | 若苗と空 | 若苗グリーン／空色、爽やかで軽い |
| 20 | 山吹と白磁 | 白磁の地／鮮やかな山吹（旧・金泥のくすみを作り直し） |
| 21 | 墨と白磁 | 墨と白磁、シリーズで最もすっきり最小限（21〜30は「墨と〜」シリーズ：全テーマ共通で墨が本文と構造＝フッター等の濃色部を担い、相手色が爽やかなアクセント） |
| 22 | 墨と空 | 墨と澄んだ空色 |
| 23 | 墨と若芽 | 墨と若芽グリーン、芽吹きの明るさ |
| 24 | 墨と柑橘 | 墨と柑橘の鮮やかなアンバー |
| 25 | 墨と藤 | 墨と淡い藤色 |
| 26 | 墨と珊瑚 | 墨と爽やかな珊瑚 |
| 27 | 墨とミント | 墨とミントグリーン |
| 28 | 墨と若草 | 墨と若草グリーン |
| 29 | 墨と桃 | 墨と柔らかな桃色 |
| 30 | 墨と浅葱 | 墨と浅葱の淡い藍、涼しく爽やか |

### フォント（20種）

各フォントのラベルは、そのフォント自身で表示されます。

| # | フォント名 | 見出し | 本文 |
| --- | --- | --- | --- |
| 1 | 端正ゴシック | Noto Sans JP | Noto Sans JP |
| 2 | しっぽり明朝 | Shippori Mincho | Noto Sans JP |
| 3 | Zen Old Mincho | Zen Old Mincho | Noto Sans JP |
| 4 | Serifクラシック | Noto Serif JP | Noto Sans JP |
| 5 | 丸ゴシック | M PLUS Rounded 1c | M PLUS Rounded 1c |
| 6 | Zen Kaku | Zen Kaku Gothic New | Noto Sans JP |
| 7 | さわらびゴシック | Sawarabi Gothic | Sawarabi Gothic |
| 8 | しっぽり明朝B1 | Shippori Mincho B1 | Noto Serif JP |
| 9 | 小杉ゴシック | Kosugi | Noto Sans JP |
| 10 | Kaisei Decol | Kaisei Decol | Noto Sans JP |
| 11 | Kiwi Maru | Kiwi Maru | M PLUS Rounded 1c |
| 12 | Zen Kaku太字 | Zen Kaku Gothic New（見出し太字・詰め気味） | Zen Kaku Gothic New |
| 13 | Zen Maru | Zen Maru Gothic | Zen Maru Gothic |
| 14 | さわらび明朝 | Sawarabi Mincho | Noto Serif JP |
| 15 | しっぽり明朝Light | Shippori Mincho（軽い字面） | Noto Sans JP |
| 16 | 筆文字 | Yuji Syuku | Noto Sans JP |
| 17 | Kaisei Opti | Kaisei Opti | Noto Sans JP |
| 18 | ひな明朝 | Hina Mincho | Noto Serif JP |
| 19 | Murecho | Murecho | Murecho |
| 20 | しっぽりアンティーク | Shippori Antique | Noto Sans JP |

### 自分でテーマ／フォントを追加・編集するには

定義はすべて「データ配列＋CSS変数ブロック」の2点セットで、UI（タブ）は配列から自動生成されるため、配列に足すだけでセレクターに新しい選択肢が現れます。

**カラーテーマを足す場合**
1. `src/config/themes.ts` の `COLOR_THEMES` 配列に `{ id, name, chips }` を1件追加します（`chips` はタブに表示する代表色5色）。
2. `src/index.css` に `[data-theme="<id>"] { --bg: …; --surface: …; --text: …; --accent: …; --deep: …; ほか }` のブロックを1つ追加します（既存ブロックを複製して色を差し替えるのが簡単です）。本文 `--text` と地 `--bg` のコントラストは 7:1 以上を目安にしてください。明るい色を文字アクセントに使う場合は、一段濃くした色を `--accent` に入れてください（既存テーマがそうしています）。

**フォントを足す場合**
1. `src/config/fonts.ts` の `FONT_SETS` 配列に `{ id, name, headingName, bodyName, headingCss, bodyCss }` を1件追加します。
2. `src/index.css` に `[data-font="<id>"] { --font-heading: …; --font-body: …; --ls-body: …; }` のブロックを1つ追加します。新しいフォントファミリーを使う場合は、`src/index.css` 先頭の Google Fonts `@import` にそのファミリーを足してください。各スタックにはヒラギノ／游書体等のシステムフォントへのフォールバックを付けてください。

- 既定の組み合わせを変える場合は、`src/config/themes.ts` の `DEFAULT_THEME_ID` と `src/config/fonts.ts` の `DEFAULT_FONT_ID` を変更してください。
- フォントは Google Fonts から読み込みます。各フォントにはシステムフォントへのフォールバックが付いているので、読み込みに失敗しても表示は崩れません。

## お問い合わせフォームの送信先設定（重要）

このプロジェクトは静的サイトなので、フォームの送信先はご自身で用意していただく必要があります。設定は **`src/config.ts`** の2つの定数で行います。

| 定数 | 意味 |
| --- | --- |
| `FORM_ENDPOINT` | フォーム内容を JSON で POST する先の URL。Formspree、Basin、自前の CGI / API など、JSON を受け取れるフォームハンドラの URL を指定します。 |
| `CONTACT_EMAIL` | `FORM_ENDPOINT` が空のときのフォールバック。メールアドレスを設定すると、送信ボタンでメールソフトが開き、入力内容が本文に入ります。 |

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

**両方とも空のまま公開すると、フォームは「送信先が未設定です」という案内を表示します。** 公開前に必ずどちらかを設定してください。

## 構成

```
.
├── index.html                  エントリ HTML
├── package.json
├── vite.config.ts              Vite + React + Tailwind CSS v4 設定
├── tsconfig*.json
├── public/
│   └── images/
│       └── mco7-1.webp … mco7-6.webp   LP で使うイラスト（全6点）
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── config.ts               フォーム送信先の設定（上記参照）
    ├── config/
    │   ├── themes.ts           カラーテーマ30種の定義（名前・チップ色）
    │   └── fonts.ts            フォント20種の定義（名前・見出し／本文フォント）
    ├── index.css               テーマ（[data-theme] の色変数／[data-font] のフォント変数・タイポグラフィ・アニメーション）
    └── components/
        ├── Header.tsx          ヘッダー / ナビゲーション
        ├── ThemeBar.tsx        カラー30種／フォント20種の独立切替タブ
        ├── Hero.tsx            ヒーロー（mco7-1 外観）
        ├── Philosophy.tsx      設計の思想（mco7-2）
        ├── Services.tsx        サービス（mco7-3 内観）
        ├── HowWeWork.tsx       仕事の進め方（mco7-4）
        ├── Works.tsx           仕事の分野（mco7-5 / mco7-6 ディテール）
        ├── Journal.tsx         ジャーナル
        ├── Company.tsx         会社について
        ├── InquiryForm.tsx     お問い合わせフォーム
        ├── Footer.tsx          フッター
        └── ui.tsx              共通部品（スクロール演出・パララックス・見出し）
```

## イラストについて

`public/images/` のイラスト6点（mco7-1〜6）は、建築をモチーフとしたデザイン素材です。

## フォントについて

フォントはカラーテーマとは独立に選べます（上記「フォント（20種）」参照）。フォントは Google Fonts から読み込みます（`src/index.css` 先頭の `@import` で、Noto Sans JP / Noto Serif JP / Shippori Mincho / Shippori Mincho B1 / Shippori Antique / Zen Old Mincho / Zen Kaku Gothic New / Zen Maru Gothic / M PLUS Rounded 1c / Murecho / Sawarabi Gothic / Sawarabi Mincho / Kosugi / Kaisei Decol / Kaisei Opti / Kiwi Maru / Yuji Syuku / Hina Mincho を一括読み込み）。各フォントのスタックにはヒラギノ角ゴ／ヒラギノ明朝／游ゴシック／游明朝等へのフォールバックが含まれます。オフライン環境で使う場合は `@import` の行を削除しても、システムフォントでそのまま表示されます（フォントごとの字体の違いは弱くなります）。
