import { headers } from "next/headers";
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

export async function getAuth0Client() {
  return new Auth0Client({
    async beforeSessionSaved(session, idToken) {
      return {
        ...session,
        idToken,
      };
    },
    authorizationParameters: {
      audience: NEXT_PUBLIC_VENUS_AUDIENCE,
    },
    appBaseUrl: await getBaseUrl(),
  });
}

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
