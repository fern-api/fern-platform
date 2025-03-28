"use server";

import { ApiResponse, GetMembers200ResponseOneOfInner } from "auth0";

import { AsyncCache } from "./AsyncCache";
import { getAuth0ManagementClient, getCurrentOrgId } from "./auth0";
import { Auth0OrgID } from "./types";

const ORGANIZATION_MEMBERS_CACHE = new AsyncCache<
  Auth0OrgID,
  GetMembers200ResponseOneOfInner[]
>({
  ttlInSeconds: 10,
});

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
