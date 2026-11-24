// トップの切り込みに映す部屋のイラストを、建物のイラスト（mco7-1.webp）の描き方に近づけた画像を作る。
// 実行: npm run rooms   （部屋のイラストを差し替えたときだけ実行すればよい）
//
// 建物のイラストは「色数の少ない平らな色面」「墨・深緑・砂・クリームの配色」「紙の繊維の質感」でできている。
// 部屋のイラストに次の 3 つの処理をかけて、それに合わせる。
//   1) 色数をしぼって平らな色面にする（ディザなし）
//   2) 明るさに応じて、建物の配色（墨 → 深緑 → 砂 → クリーム）へ一定の割合で寄せる
//   3) 建物のイラストの紙だけの部分を敷き詰めて、乗算で重ねる（紙の繊維の質感）
// 元の画像はそのまま残し、src/assets/images/<元の名前>-styled.webp に保存する。
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const img = (name) => fileURLToPath(new URL(`../src/assets/images/${name}`, import.meta.url));

// 変換する画像と設定（colours: 色数 / blend: 配色へ寄せる割合 0〜1 / paper: 紙の質感の濃さ 0〜1）
const TARGETS = [
  { src: "dining-a-flat.webp", colours: 10, blend: 0.55, paper: 1 }, // 8階 食堂
  { src: "lobby-a3-flat.webp", colours: 10, blend: 0.55, paper: 1 }, // 1階 ロビー
];

// 建物のイラストの配色（暗い → 明るい）
const STOPS = [
  [0.0, [0x1f, 0x23, 0x21]], // 墨
  [0.33, [0x1d, 0x5c, 0x52]], // 深緑
  [0.66, [0xc9, 0xbf, 0xa3]], // 砂
  [1.0, [0xf3, 0xed, 0xdc]], // クリーム（紙）
];
const gradient = (t) => {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i];
    const [b, cb] = STOPS[i + 1];
    if (t <= b) {
      const u = (t - a) / (b - a);
      return ca.map((v, k) => v + (cb[k] - v) * u);
    }
  }
  return STOPS[STOPS.length - 1][1];
};

// 紙の質感：建物のイラストの左端の、紙だけが見えている部分（x 10〜200, y 400〜610）
const paperTile = await sharp(img("mco7-1.webp"))
  .extract({ left: 10, top: 400, width: 190, height: 210 })
  .png()
  .toBuffer();

for (const t of TARGETS) {
  const { width: W, height: H } = await sharp(img(t.src)).metadata();

  // 1) 色数をしぼって平らな色面にする
  const flat = await sharp(img(t.src)).png({ palette: true, colours: t.colours, dither: 0 }).toBuffer();
  const { data, info } = await sharp(flat).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // 2) 明るさに応じて建物の配色へ寄せる
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const m = gradient((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255);
    data[i] = Math.round(r + (m[0] - r) * t.blend);
    data[i + 1] = Math.round(g + (m[1] - g) * t.blend);
    data[i + 2] = Math.round(b + (m[2] - b) * t.blend);
  }
  const toned = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();

  // 3) 紙の質感を敷き詰めて乗算で重ねる（paper が小さいほど薄く）
  let paper = await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite([{ input: paperTile, tile: true }])
    .png()
    .toBuffer();
  paper = await sharp(paper).linear(t.paper, 255 * (1 - t.paper)).png().toBuffer();

  const out = img(t.src.replace(/\.webp$/, "-styled.webp"));
  const result = await sharp(toned)
    .composite([{ input: paper, blend: "multiply" }])
    .webp({ quality: 90 })
    .toFile(out);

  console.log(`${t.src} -> ${out.split(/[\\/]/).pop()}: ${result.width}x${result.height}, ${(result.size / 1024).toFixed(0)}KB`);
}
