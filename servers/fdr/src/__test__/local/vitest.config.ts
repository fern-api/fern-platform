import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ["src/__test__/local/setupMockFdr.ts"],
    },
});
