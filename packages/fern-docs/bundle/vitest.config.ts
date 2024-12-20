import crypto from "crypto";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    env: {
      WORKOS_API_KEY: "workos_test_api_key",
      WORKOS_CLIENT_ID: "workos_test_client_id",
      JWT_SECRET_KEY: crypto.randomBytes(16).toString("hex"),
    },
  },
});
