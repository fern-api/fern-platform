import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    env: {},
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
