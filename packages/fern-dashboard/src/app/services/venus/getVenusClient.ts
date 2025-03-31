/* eslint-disable turbo/no-undeclared-env-vars */
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";

export function getVenusClient({
  token,
}: {
  token: string;
}): FernVenusApiClient {
  if (process.env.VENUS_SERVER_URL == null) {
    throw new Error(
      "VENUS_SERVER_URL is not defined in the current environment"
    );
  }
  return new FernVenusApiClient({
    environment: process.env.VENUS_SERVER_URL,
    token,
  });
}
