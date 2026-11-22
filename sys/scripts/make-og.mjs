// OGP 画像（1200x630）を、トップのイラストから生成して public/og.jpg に保存する。
// 実行: npm run og   （イラストを差し替えたときだけ実行すればよい）
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../src/assets/images/mco7-1.webp", import.meta.url));
const out = fileURLToPath(new URL("../public/og.jpg", import.meta.url));

const info = await sharp(src)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);

console.log(`og.jpg: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
