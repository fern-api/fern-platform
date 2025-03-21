import { ManagementClient } from "auth0";
import jwt from "jsonwebtoken";

import { auth0 } from "@/lib/auth0";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

if (AUTH0_DOMAIN == null) {
  throw new Error("AUTH0_DOMAIN is not defined");
}
if (AUTH0_CLIENT_ID == null) {
  throw new Error("AUTH0_CLIENT_ID is not defined");
}
if (AUTH0_CLIENT_SECRET == null) {
  throw new Error("AUTH0_CLIENT_SECRET is not defined");
}

export const AUTH0_MANAGEMENT_CLIENT = new ManagementClient({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
});

export async function getCurrentSession() {
  const session = await auth0.getSession();
  if (session == null) {
    throw new Error("Not authenticated");
  }
  if (session.idToken == null) {
    throw new Error("isToken is not present on session");
  }
  if (typeof session.idToken !== "string") {
    throw new Error(
      `isToken is of type ${typeof session.idToken} (expected string)`
    );
  }

  const jwtPayload = jwt.decode(session.idToken);
  if (jwtPayload == null) {
    throw new Error("JWT payload is not defined");
  }
  if (typeof jwtPayload !== "object") {
    throw new Error("JWT payload is not an object");
  }
  if (jwtPayload?.sub == null) {
    throw new Error("JWT payload does not include 'sub'");
  }

  return { session, userId: jwtPayload.sub };
}
