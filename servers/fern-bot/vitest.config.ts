import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    alias: {
      "@functions/": new URL("src/functions/", import.meta.url).pathname,
      "@generated/": new URL("src/generated/", import.meta.url).pathname,
      "@libs/": new URL("src/libs/", import.meta.url).pathname,
      "@utils/": new URL("src/utils/", import.meta.url).pathname,
    },
  },
});
