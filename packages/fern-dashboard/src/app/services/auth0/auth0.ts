/* eslint-disable turbo/no-undeclared-env-vars */
import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { getAppUrlServerSide } from "../../../utils/getAppUrlServerSide";

export async function getAuth0Client() {
  return new Auth0Client({
    authorizationParameters: {
      audience: process.env.NEXT_PUBLIC_VENUS_AUDIENCE,
    },
    appBaseUrl: await getAppUrlServerSide(),
    httpTimeout: 60_000,
  });
}

export function getAuth0ClientId() {
  if (process.env.AUTH0_CLIENT_ID == null) {
    throw new Error(
      "AUTH0_CLIENT_ID is not defined in the current environment"
    );
  }
  return process.env.AUTH0_CLIENT_ID;
}
