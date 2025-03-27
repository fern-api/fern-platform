/* eslint-disable turbo/no-undeclared-env-vars */
import { FdrClient } from "@fern-api/fdr-sdk";

export function getFdrClient({ token }: { token: string }): FdrClient {
  if (process.env.FDR_SERVER_URL == null) {
    throw new Error("FDR_SERVER_URL is not defined in the current environment");
  }
  return new FdrClient({
    environment: process.env.FDR_SERVER_URL,
    token,
  });
}
