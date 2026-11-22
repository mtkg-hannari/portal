import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 静的サイトとしてビルドします。dist/ の中身をそのまま
// 任意の静的ホスティングにデプロイしてください。
// base: "./" の相対パスでビルドするため、ドメイン直下でもサブフォルダ
// （例: https://example.sakura.ne.jp/portal/）でも動作します。
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
