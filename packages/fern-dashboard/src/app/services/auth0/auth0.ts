import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { getAppUrlServerSide } from "../../../utils/getAppUrlServerSide";

export async function getAuth0Client() {
  return new Auth0Client({
    authorizationParameters: {
      audience: process.env.NEXT_PUBLIC_VENUS_AUDIENCE,
    },
    appBaseUrl: await getAppUrlServerSide(),
  });
}
