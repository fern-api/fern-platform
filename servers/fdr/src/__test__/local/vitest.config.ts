import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ["src/__test__/local/setupMockFdr.ts"],
        // Don't run in parallel so it's easy to manage db state across tests.
        fileParallelism: false,
    },
});
