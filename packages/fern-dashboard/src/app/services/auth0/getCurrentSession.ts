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
  if (session.idToken == null) {
    throw new Error("idToken is not present on session");
  }
  if (typeof session.idToken !== "string") {
    throw new Error(
      `idToken is of type ${typeof session.idToken} (expected string)`
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

  const orgId = session.user.org_id;
  if (orgId == null) {
    throw new Error("JWT payload does not have org_id");
  }

  return {
    session: session,
    userId: Auth0UserID(jwtPayload.sub),
    orgId: Auth0OrgID(orgId),
  };
}
