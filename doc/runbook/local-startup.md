# ランブック: ローカルPCでの起動方法

対象: はんなりdev ポータル（`portal/sys`、Astro 製の静的サイト）
最終更新: 2026-11-22

## 1. 早見表

PowerShell またはターミナルで、`sys` フォルダに移動してから実行します。

```powershell
cd E:\dev\vs_code\products\hannari.dev\portal\sys

npm install        # 初回だけ（node_modules が無いとき）
npm run dev        # 開発サーバーを起動 → http://localhost:4321/
```

止めるときは、起動したターミナルで `Ctrl + C` を押します。

| やりたいこと | コマンド | 開くURL |
| --- | --- | --- |
| 編集しながら確認する（開発サーバー） | `npm run dev` | http://localhost:4321/ |
| 公開用ファイルと同じものを確認する | `npm run build` → `npm run preview` | http://localhost:4321/ |
| 型のエラーを確認する | `npm run check` | （ブラウザ不要） |
| 公開用ファイルを作る | `npm run build` | `dist/` に出力 |

## 2. 前提

| 項目 | 内容 |
| --- | --- |
| Node.js | **22.22.1 以上**（この PC は nvm-windows で 22.23.5 を使用）。`node -v` で確認。バージョン管理は nvm-windows（`nvm list` で一覧、`nvm use 22.23.5` で切り替え） |
| npm | Node.js に同梱（`npm -v` で確認） |
| ブラウザ | Chrome など |
| ネットワーク | 初回の `npm install` と、Google Fonts（丸ゴシック）の読み込みに必要 |

## 3. 開発サーバーを起動する（`npm run dev`）

1. ターミナルを開き、`sys` フォルダに移動します。
2. 初めて、または `node_modules` フォルダが無い場合は `npm install` を実行します（数十秒〜1分程度）。
3. `npm run dev` を実行します。
4. 次のような表示が出たら起動しています。

   ```
   astro v6.x.x ready
   Local    http://localhost:4321/
   ```

5. ブラウザで http://localhost:4321/ を開きます。
6. `src/` のファイルを保存すると、ブラウザに自動で反映されます。

### 開発サーバーで確認できるページ

| URL | 内容 |
| --- | --- |
| `/` | トップページ |
| `/privacy/` | プライバシーポリシー |
| `/journal/` | Journal 一覧（記事が無い間は「記事は順次公開していきます。」） |
| `/journal/記事の英数字名/` | Journal の記事（`src/content/journal/` に記事を置いたとき） |
| `/404` | 404 ページの確認用（存在しない URL でも表示されます） |

> 開発サーバーは**自分の PC の中だけ**で使ってください。`--host` オプション（同じネットワークの他の機器に公開する指定）は付けないでください。

## 4. 公開用と同じ状態で確認する（`build` → `preview`）

公開前の最終確認では、開発サーバーではなく、実際にアップロードするファイルを確認します。

```powershell
npm run build      # dist/ に公開用ファイルを作る
npm run preview    # dist/ の中身を http://localhost:4321/ で表示
```

- `preview` は、`build` で作った `dist/` を表示します。**ソースを変更したら、もう一度 `npm run build` が必要**です。
- 画像の最適化・sitemap・robots.txt・404 ページは、`build` したときだけ生成されます（開発サーバーでは `sitemap` などは確認できません）。
- `dist/` の中身を、さくらのレンタルサーバーへアップロードします（手順は `sys/README.md`）。

## 5. 変更の種類と、確認の仕方

| 変更したもの | 場所 | 確認 |
| --- | --- | --- |
| 文章・セクションの内容 | `src/components/*.astro` | `npm run dev` で自動反映 |
| 色・フォント | `src/styles/global.css` 冒頭の `:root` | `npm run dev` で自動反映 |
| Journal 記事 | `src/content/journal/*.md`（`draft: false` にする） | `npm run dev` → `/journal/` |
| フォーム送信先 | `src/config.ts` | 送信テストは `build` → `preview` で |
| 公開 URL（canonical・OGP など） | `astro.config.mjs` の `SITE` | `npm run build` 後に `dist/index.html` を確認 |
| イラストを差し替えた | `src/assets/images/` | `npm run og`（OGP画像を作り直す）→ `npm run build` |

## 6. うまくいかないとき

| 症状 | 原因と対処 |
| --- | --- |
| `npm: command not found` / 「認識されません」 | Node.js が未インストール、またはターミナルを開き直していない。Node.js（22.12 以上）をインストールし、ターミナルを開き直す |
| `The current Node.js version … is not supported` のようなエラー | Node.js が古い。`node -v` で確認し、`nvm use 22.23.5` で切り替える（未インストールなら先に `nvm install 22.23.5`） |
| `npm warn EBADENGINE … package: 'sitemap@10.0.0', required: { node: '>=22.22.1' }, current: { node: 'v22.22.0' }` | **警告であり、エラーではありません。** sitemap の作成に使う `sitemap` パッケージが、Node 22.22.1 以上を求めているため（この PC は 22.22.0）。`npm install`・`npm run dev`・`npm run build` は動作し、sitemap も生成されます。Node.js を 22.22.1 以上に更新すると消えます（この PC は 2026-11-22 に 22.23.5 へ更新済みで、警告は出なくなりました）。`nvm use 22.23.5` で切り替わっているか `node -v` で確認してください。Astro 7（Node 22.23.4 以上）への移行条件も満たしています |
| `Cannot find module …` | `npm install` が未実行、または途中で失敗。`sys` フォルダで `npm install` をやり直す |
| `npm install` が `EPERM`（操作が拒否されました）で失敗 | ファイルがウイルス対策ソフトやエディタに使われている。少し待ってもう一度 `npm install` を実行。直らなければ `node_modules` フォルダを削除してから再実行 |
| `Port 4321 is in use` / 別のポート（4322 など）で起動する | 4321 を別のプロセスが使用中。表示された**実際の URL**を開く。以前の開発サーバーが残っている場合は、そのターミナルで `Ctrl + C` |
| 画面が真っ白／スタイルが当たらない | `npm run dev` を `Ctrl + C` で止めて再起動。それでも直らなければ `.astro` フォルダを削除して再起動 |
| 文字が丸ゴシックにならない | Google Fonts を読み込めていない（オフライン等）。ネットワークを確認。読み込めない間は代替フォントで表示される |
| ビルド時に `No files found matching "**/[^_]*.md"` と出る | Journal の記事が 0 本のときの警告。**問題なし**（記事を追加すると消える） |
| `build` で `Missing field tsconfigPaths …` と出る | vite の版が 2 種類入っている。`npm ls vite` で `vite@7` に揃っているか確認し、`sys` で `npm install` をやり直す |
| フォームの送信で「送信先が未設定です」と出る | 仕様どおり。`src/config.ts` の `FORM_ENDPOINT` または `CONTACT_EMAIL` を設定（設定後に `npm run build`） |

## 7. 補足

- **旧版（Vite + React 版）**は `portal/archive/sys-vite-20261122/` にあります。起動するには、そのフォルダで `npm install` → `npm run dev` を実行します（Astro 版とは別のプロジェクトです）。
- 旧版の公開用ビルドは `portal/release/v1-vite-dist/` にあります。ローカルで見るには、そのフォルダで `python -m http.server 4400` を実行し、http://localhost:4400/ を開きます。
- `node_modules` と `dist` は、いつ削除しても `npm install`・`npm run build` で作り直せます。
- 依存パッケージを更新するときは、`npm ls vite` で vite が 7 系 1 種類になっていることを確認してください（詳細は `doc/dev-plan/result/dev-plan-002-astro-report.md` §6.4）。
