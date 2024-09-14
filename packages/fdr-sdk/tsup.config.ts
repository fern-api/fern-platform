import { defineConfig } from "tsup";

export default defineConfig({
    // Outputs `dist/a.js` and `dist/b.js`.
    entry: ["src/index.ts", "src/navigation/index.ts", "src/client/types.ts"],
    format: ["cjs", "esm"],
    splitting: true,
    sourcemap: true,
    clean: true,
    dts: true,
});
