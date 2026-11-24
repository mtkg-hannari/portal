// 資格の合格証書の写真から、個人情報（氏名・生年月日）を消した表示用の画像を作り、
// private/images/certs/ に WebP で保存する（private/ は git に含めず、公開もしない）。証書番号は合格の裏づけとして残す。
//
// 実行: node scripts/make-certs.mjs [元画像のフォルダ]
//   元画像のフォルダを省略すると private/certs/ を読む（git には含めない）。
//   元画像のファイル名: PM_trim.png / DB_trim.png / NW_trim.png / BOKI_trim.png
//
// 消し方:
//   patch-left … 同じ高さの左側にある無地の部分を貼り付ける（地紋が残るので自然に見える）
//   median     … 周りの色で塗りつぶす（左側に無地の部分がない場所に使う）
// 範囲は画像の幅・高さに対する割合で指定する。
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = resolve(root, process.argv[2] ?? "private/certs");
const outDir = resolve(root, "private/images/certs");
const HEIGHT = 1200;

const CERTS = [
  {
    file: "PM_trim.png",
    out: "pm.webp",
    masks: [
      { label: "氏名", method: "patch-left", x0: 0.545, x1: 0.8, y0: 0.352, y1: 0.397 },
      { label: "生年月日", method: "patch-left", x0: 0.52, x1: 0.895, y0: 0.403, y1: 0.44 },
    ],
  },
  {
    file: "DB_trim.png",
    out: "db.webp",
    masks: [
      { label: "氏名", method: "patch-left", x0: 0.54, x1: 0.8, y0: 0.34, y1: 0.386 },
      { label: "生年月日", method: "patch-left", x0: 0.512, x1: 0.898, y0: 0.4, y1: 0.436 },
    ],
  },
  {
    file: "NW_trim.png",
    out: "nw.webp",
    masks: [
      { label: "氏名", method: "patch-left", x0: 0.54, x1: 0.79, y0: 0.345, y1: 0.393 },
      { label: "生年月日", method: "patch-left", x0: 0.509, x1: 0.882, y0: 0.405, y1: 0.44 },
    ],
  },
  {
    file: "BOKI_trim.png",
    out: "boki.webp",
    masks: [
      { label: "氏名", method: "median", x0: 0.535, x1: 0.8, y0: 0.344, y1: 0.385 },
      { label: "生年月日（下線を含む）", method: "median", x0: 0.53, x1: 0.85, y0: 0.384, y1: 0.42 },
    ],
  },
];

mkdirSync(outDir, { recursive: true });

for (const cert of CERTS) {
  const src = resolve(srcDir, cert.file);
  const { width: W, height: H } = await sharp(src).metadata();
  let buf = await sharp(src).toBuffer();

  for (const m of cert.masks) {
    const left = Math.round(m.x0 * W);
    const top = Math.round(m.y0 * H);
    const width = Math.round((m.x1 - m.x0) * W);
    const height = Math.round((m.y1 - m.y0) * H);

    let patch;
    if (m.method === "patch-left") {
      const srcLeft = Math.max(0, left - width - Math.round(0.01 * W));
      patch = await sharp(buf).extract({ left: srcLeft, top, width, height }).toBuffer();
    } else {
      // 文字の線は細いので、大きめの窓で中央値をとると背景の色だけが残る
      const size = Math.round(height * 0.9) | 1;
      patch = await sharp(buf)
        .extract({ left, top, width, height })
        .median(size)
        .blur(4)
        .toBuffer();
    }
    buf = await sharp(buf).composite([{ input: patch, left, top }]).toBuffer();
  }

  const info = await sharp(buf)
    .resize({ height: HEIGHT })
    .webp({ quality: 82 })
    .toFile(resolve(outDir, cert.out));
  console.log(`${cert.out}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
}
