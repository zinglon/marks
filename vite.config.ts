import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyManifest } from "./plugins/copyManifest";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), copyManifest()],
});
