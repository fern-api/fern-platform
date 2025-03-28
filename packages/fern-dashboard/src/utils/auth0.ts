import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

export async function getAuth0Client() {
  return new Auth0Client({
    async beforeSessionSaved(session, idToken) {
      return {
        ...session,
        idToken,
      };
    },
    authorizationParameters: {
      audience: process.env.NEXT_PUBLIC_VENUS_AUDIENCE,
    },
    appBaseUrl: await getBaseUrl(),
  });
}

// copied from https://github.com/auth0/nextjs-auth0/issues/1882#issuecomment-2732867513
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();

  const host = headersList.get("host");
  if (host == null) {
    throw new Error("host header is not present");
  }

  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  return `${protocol}://${host}`;
}

export async function getSessionOrRedirect() {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();
  if (session == null) {
    redirect("/");
  }
  return session;
}
