/* eslint-disable turbo/no-undeclared-env-vars */
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";

let venusClient: FernVenusApiClient | undefined;

export function getVenusClient({
  token,
}: {
  token: string;
}): FernVenusApiClient {
  if (venusClient == null) {
    if (process.env.VENUS_SERVER_URL == null) {
      throw new Error(
        "VENUS_SERVER_URL is not defined in the current environment"
      );
    }
    venusClient = new FernVenusApiClient({
      environment: process.env.VENUS_SERVER_URL,
      token,
    });
  }
  return venusClient;
}
