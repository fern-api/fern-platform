import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "packages/*",
    {
        test: {
            include: ["test/fern-dev-e2e/**/*.test.{ts,js}"],
            name: "fern-dev-e2e",
        },
    },
]);
