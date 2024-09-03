import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        exclude: ["src/__test__/local/**", "src/__test__/ete/**"],
        // Don't run in parallel so it's easy to manage db state across tests.
        fileParallelism: false,
    },
});
