import { redirect } from "next/navigation";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

const { NEXT_PUBLIC_VENUS_AUDIENCE, NEXT_PUBLIC_APP_BASE_URL } = process.env;

if (NEXT_PUBLIC_VENUS_AUDIENCE == null) {
  throw new Error(
    "NEXT_PUBLIC_VENUS_AUDIENCE is not defined in the environment"
  );
}

if (NEXT_PUBLIC_APP_BASE_URL == null) {
  throw new Error("NEXT_PUBLIC_APP_BASE_URL is not defined in the environment");
}

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
  appBaseUrl: NEXT_PUBLIC_APP_BASE_URL,
});

export async function getSessionOrRedirect() {
  const session = await auth0.getSession();
  if (session == null) {
    redirect("/");
  }
  return session;
}
