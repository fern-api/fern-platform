import { redirect } from "next/navigation";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

if (process.env.VENUS_AUDIENCE == null) {
  throw new Error("VENUS_AUDIENCE is not defined in the environment");
}

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session, idToken) {
    return {
      ...session,
      idToken,
    };
  },
  authorizationParameters: {
    audience: process.env.NEXT_PUBLIC_VENUS_AUDIENCE,
  },
});

export async function getSessionOrRedirect() {
  const session = await auth0.getSession();
  if (session == null) {
    redirect("/");
  }
  return session;
}
