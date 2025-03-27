import { redirect } from "next/navigation";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

const ZACH_TEST_APP_BASE_URL = process.env.ZACH_TEST_APP_BASE_URL;
const NEXT_PUBLIC_VENUS_AUDIENCE = process.env.NEXT_PUBLIC_VENUS_AUDIENCE;

if (NEXT_PUBLIC_VENUS_AUDIENCE == null) {
  throw new Error(
    "NEXT_PUBLIC_VENUS_AUDIENCE is not defined in the environment"
  );
}

if (ZACH_TEST_APP_BASE_URL == null) {
  throw new Error("ZACH_TEST_APP_BASE_URL is not defined in the environment");
}

console.log(
  { NEXT_PUBLIC_VENUS_AUDIENCE, ZACH_TEST_APP_BASE_URL },
  process.env
);

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session, idToken) {
    return {
      ...session,
      idToken,
    };
  },
  authorizationParameters: {
    audience: NEXT_PUBLIC_VENUS_AUDIENCE,
  },
  appBaseUrl: ZACH_TEST_APP_BASE_URL,
});

export async function getSessionOrRedirect() {
  const session = await auth0.getSession();
  if (session == null) {
    redirect("/");
  }
  return session;
}
