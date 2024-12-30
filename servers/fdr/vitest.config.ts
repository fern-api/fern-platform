import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        exclude: ["src/__test__/local/**", "src/__test__/ete/**", "node_modules/**"],
    },
});
