"use server";

import {
  ApiResponse,
  GetMembers200ResponseOneOfInner,
  GetOrganizations200ResponseOneOfInner,
} from "auth0";
import jwt from "jsonwebtoken";

import { getAuth0Client } from "@/utils/auth0";
import { getOrgIdOrThrow } from "@/utils/getOrgIdOrThrow";

import { AsyncCache } from "../AsyncCache";
import { getAuth0ManagementClient } from "./getAuth0ManagementClient";
import { Auth0OrgID, Auth0UserID } from "./types";

export async function getCurrentSession() {
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

  return { session, userId: jwtPayload.sub as Auth0UserID };
}

export async function getCurrentOrgId() {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();
  if (session == null) {
    throw new Error("session is not defined");
  }
  return getOrgIdOrThrow(session);
}

// caches

const ORGANIZATIONS_CACHE = new AsyncCache<
  Auth0OrgID,
  GetOrganizations200ResponseOneOfInner
>({
  ttlInSeconds: 10,
});

const MY_ORGANIZATIONS_CACHE = new AsyncCache<
  Auth0UserID,
  GetOrganizations200ResponseOneOfInner[]
>({
  ttlInSeconds: 10,
});

const ORGANIZATION_MEMBERS_CACHE = new AsyncCache<
  Auth0OrgID,
  GetMembers200ResponseOneOfInner[]
>({
  ttlInSeconds: 10,
});

export async function clearCachesAfterCreatingOrganization(
  userId: Auth0UserID
) {
  MY_ORGANIZATIONS_CACHE.invalidate(userId);
}

// helpers

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

export async function getMyOrganizations() {
  const { userId } = await getCurrentSession();

  return await MY_ORGANIZATIONS_CACHE.get(userId, async () => {
    const { data: organizations } =
      await getAuth0ManagementClient().users.getUserOrganizations({
        id: userId,
      });
    return organizations;
  });
}

export async function getCurrentOrgMembers() {
  return await getOrgMembers(await getCurrentOrgId());
}

export async function getOrgMembers(orgId: Auth0OrgID) {
  return await ORGANIZATION_MEMBERS_CACHE.get(orgId, () =>
    getAllOrganizationMembers(orgId)
  );
}

async function getAllOrganizationMembers(orgId: Auth0OrgID) {
  const members: GetMembers200ResponseOneOfInner[] = [];

  const auth0 = getAuth0ManagementClient();

  let pageIndex = 0;
  let page: ApiResponse<GetMembers200ResponseOneOfInner[]>;
  do {
    page = await auth0.organizations.getMembers({
      id: orgId,
      page: pageIndex,
      per_page: 100,
      fields: "user_id,picture,name,email,roles",
    });
    members.push(...page.data);
    pageIndex++;
  } while (
    page.data.length > 0 &&
    // the auth0 API only supports loading 1,000 users via basic pagination
    members.length < 1000
  );

  return members;
}
