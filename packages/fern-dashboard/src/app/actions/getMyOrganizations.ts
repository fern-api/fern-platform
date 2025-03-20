"use server";

import { getSession } from "@auth0/nextjs-auth0";
import jwt from "jsonwebtoken";

import { AUTH0_MANAGEMENT_CLIENT } from "./auth0";

export async function getMyOrganizations() {
  const session = await getSession();
  if (session?.idToken == null) {
    throw new Error("Not authenticated");
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

  const organizations =
    await AUTH0_MANAGEMENT_CLIENT.users.getUserOrganizations({
      id: jwtPayload.sub,
    });

  return organizations;
}
