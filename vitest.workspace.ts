import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "packages/*",
    {
        test: {
            include: ["test/docs-dev-e2e/**/*.test.{ts,js}"],
            name: "docs-dev-e2e",
        },
    },
]);
