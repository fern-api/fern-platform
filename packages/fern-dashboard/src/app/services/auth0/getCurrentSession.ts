import { SessionData } from "@auth0/nextjs-auth0/types";
import jwt from "jsonwebtoken";

import { getAuth0Client } from "@/app/services/auth0/auth0";

import { Auth0OrgID, Auth0UserID } from "./types";

export interface FullSessionData {
  session: SessionData;
  userId: Auth0UserID;
  orgId: Auth0OrgID;
}

export async function getCurrentSession(): Promise<FullSessionData> {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();
  if (session == null) {
    throw new Error("Not authenticated");
  }

  const { orgId, userId } = decodeAccessToken(session.tokenSet.accessToken);

  return { session, orgId, userId };
}

export function decodeAccessToken(token: string) {
  const jwtPayload = jwt.decode(token);
  if (jwtPayload == null) {
    throw new Error("JWT payload is not defined");
  }
  if (typeof jwtPayload !== "object") {
    throw new Error("JWT payload is not an object");
  }
  if (jwtPayload?.sub == null) {
    throw new Error("JWT payload does not include 'sub'");
  }

  const orgId = jwtPayload.org_id;
  if (orgId == null) {
    throw new Error("JWT payload does not have org_id");
  }
  if (typeof orgId !== "string") {
    throw new Error("JWT payload's org_id is not a string");
  }

  return {
    userId: Auth0UserID(jwtPayload.sub),
    orgId: Auth0OrgID(orgId),
  };
}
