# dev-plan-004 プロフィールページの 3D デスクシーン

作成日 2026-11-25  
対象 `portal/sys` の `/profile/`  
関連 `dev-plan-003-appeal.md`

## 目的

代表者の紹介に作業環境をモチーフにしたビジュアルを添える。参考画像 `orange.png` と `purple.png` をもとに、モニターを中心に据え、左右のスピーカー、時計、デスクライト、鉢植え、キーボードを配置する。

## 実装手順

1. 代表者名の下、実績欄の上に、プロフィール専用のシーンを配置する。モバイルでも机の全体が見える構図にする。
2. Three.js で立体を組み、窓からの光と机上の影を描く。初期色はオレンジとし、ボタンでパープルに切り替えられるようにする。
3. 16:9 の画面で、表示中の画角に合わせた右 16 度を「標準」として初期表示にする。マウスやタッチの横ドラッグで、正面から左右 35 度まで視点を回転できる。左上・正面・標準・右上を選ぶボタンも用意する。
4. 描画の初期化前や WebGL が使えない環境では、同じ 3D シーンから描き出した WebP を表示する。WebP 表示では、横ドラッグまたはボタンで 4 段階の視点を切り替えられる。
5. モニターにコードを自動入力する。WebP 表示でもモニターに重ねた 2D キャンバスで動かす。手動での一時停止と、画面外・非表示タブでの停止に対応する。

## 確認項目

- [x] Astro の型チェックと本番ビルド
- [ ] デスクトップとスマートフォン幅の表示、配色の切り替え
- [ ] 動きを減らす設定と静止画へのフォールバック

## 実装結果

プロフィールの代表者名と実績欄の間に、2 色を切り替えられる 3D シーンを追加した。Three.js はシーンが表示領域に入ってから読み込む。

初期カメラは、表示中の画角から推定した右 16 度に置き、「標準」ボタンでこの角度へ戻れるようにした。正面中央の構図も「正面」ボタンで選べる。椅子を外し、参考画像と同様に画面下のデスクと上部の壁の余白を残した。

奥と左右の壁、床を 3D シーンに配置した。右の壁と床は同じ色にし、右の窓には明るい枠と銀色の金具をつけた。中央が広い 3 枚のガラス越しに、瓦屋根の家が並ぶ日本の田舎町が見える。右前方から差す光は窓の縦桟に合わせ、壁、机、小物に投影する。

壁や木の面に色の揺らぎと木目を描いた。配色は参考のスクリーンショットに合わせ、黄色の窓光、青紫の影、藍色の輪郭を組み合わせ、室内の環境光を明るくした。モニター内のコードは小さな文字で自動入力する。

静止画の更新は `sys` で `node scripts/render-profile-desk.mjs` を実行する。4 方向と 2 色を組み合わせた WebP 8 枚と、各画像のモニター位置を記録した JSON を生成する。

窓の外には組み込みの ImageGen で生成した `sys/src/assets/images/profile-desk-countryside.webp` を使う。景色を窓枠のすぐ裏に置き、斜めからも枠と景色の間に壁が見えないようにした。左右内側の縁は青灰色で揃えた。コードの描画には 480 × 268 のモニター用キャンバス上で 10 px の等幅書体を使う。

### 田舎町の生成プロンプト

> Use case: illustration-story. Create a new background for the view through a small window in a Japanese study. Show a quiet rural Japanese town from a slightly elevated second-floor viewpoint, looking down a narrow gently curving paved residential street. Feature a close cluster of ordinary Japanese two-story homes, varied gray ceramic kawara roofs, small garden hedges, one or two slender utility poles and wires, and tree-covered satoyama hills behind the town. Make buildings and the street clearly dominant and readable even at thumbnail scale, with houses on both sides and a clear sense of a real lived-in rural town. Restrained hand-painted watercolor and gouache environment with believable Japanese architecture and perspective, pale sage greens, dusty blue roof shadows, softly sunlit cream walls in a warm clear afternoon. Landscape 1.42:1 framing; high enough viewpoint to see overlapping roofs, narrow band of sky, edge-to-edge scene. View only: no window frame, interior, people, text, readable signs, logos, watermark, panoramic fields, or monumental landmarks.

型チェックはエラー・警告ともに 0 件。本番ビルドは成功し、遅延読み込みされる 3D チャンクに 500 kB 超の警告が出た。ブラウザー操作は、アプリ内の接続不良と Windows 上でのタブ URL の確認失敗により中断した。
