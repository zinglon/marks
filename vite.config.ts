import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

import { copyManifest } from "./plugins/copyManifest";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.vitest": !!(mode === "development"),
  },
  plugins: [vue(), copyManifest()],
  test: {
    includeSource: ["src/**/*.{js,ts}"],
  },
}));
