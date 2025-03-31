import {
  ApiResponse,
  GetInvitations200ResponseOneOfInner,
  GetMembers200ResponseOneOfInner,
} from "auth0";

import { getAuth0ManagementClient } from "./getAuth0ManagementClient";
import { Auth0OrgID } from "./types";

export async function getOrgMembers(orgId: Auth0OrgID) {
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

  members.sort((a, b) => (a.name < b.name ? -1 : 1));

  return members;
}

export async function getOrgInvitations(orgId: Auth0OrgID) {
  const invitations: GetInvitations200ResponseOneOfInner[] = [];

  const auth0 = getAuth0ManagementClient();

  let pageIndex = 0;
  let page: ApiResponse<GetInvitations200ResponseOneOfInner[]>;
  do {
    page = await auth0.organizations.getInvitations({
      id: orgId,
      page: pageIndex,
      per_page: 100,
    });
    invitations.push(...page.data);
    pageIndex++;
  } while (
    page.data.length > 0 &&
    // the auth0 API only supports loading 1,000 invitations via basic pagination
    invitations.length < 1000
  );

  invitations.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return invitations;
}
