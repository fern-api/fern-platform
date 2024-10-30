import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/algolia/index.ts", "src/algolia/types.ts", "src/tasks/index.ts"],
    format: ["esm"],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
});
