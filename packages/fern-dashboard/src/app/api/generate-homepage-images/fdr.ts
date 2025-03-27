/* eslint-disable turbo/no-undeclared-env-vars */
import { FdrClient } from "@fern-api/fdr-sdk";

let fdrClient: FdrClient | undefined;

export function getFdrClient({ token }: { token: string }): FdrClient {
  if (fdrClient == null) {
    if (process.env.FDR_SERVER_URL == null) {
      throw new Error(
        "FDR_SERVER_URL is not defined in the current environment"
      );
    }
    fdrClient = new FdrClient({
      environment: process.env.FDR_SERVER_URL,
      token,
    });
  }
  return fdrClient;
}
