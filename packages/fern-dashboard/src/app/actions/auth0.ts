import { GetOrganizations200ResponseOneOfInner, ManagementClient } from "auth0";
import jwt from "jsonwebtoken";

import { auth0 } from "@/lib/auth0";

import { AsyncCache } from "./AsyncCache";
import { Auth0OrgName } from "./types";

let AUTH0_MANAGEMENT_CLIENT: ManagementClient | undefined;

export function getAuth0ManagementClient() {
  if (AUTH0_MANAGEMENT_CLIENT == null) {
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

    AUTH0_MANAGEMENT_CLIENT = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    });
  }

  return AUTH0_MANAGEMENT_CLIENT;
}

export async function getCurrentSession() {
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

  return { session, userId: jwtPayload.sub };
}

export async function getCurrentOrgId() {
  const session = await auth0.getSession();

  if (session?.user.org_id == null) {
    throw new Error("org_id is not defined");
  }

  return session.user.org_id;
}

const ORGANIZATIONS_CACHE = new AsyncCache<
  Auth0OrgName,
  GetOrganizations200ResponseOneOfInner
>({
  ttlInSeconds: 10,
});

export async function getCurrentOrg() {
  const orgId = await getCurrentOrgId();

  return await ORGANIZATIONS_CACHE.get(orgId, async () => {
    const { data: organization } =
      await getAuth0ManagementClient().organizations.get({
        id: orgId,
      });
    return organization;
  });
}
