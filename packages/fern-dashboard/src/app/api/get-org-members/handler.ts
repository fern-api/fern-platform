import * as Auth0Helpers from "@/app/services/auth0/helpers";
import { Auth0OrgID } from "@/app/services/auth0/types";

export default async function getOrgMembers(orgId: Auth0OrgID) {
  const invitations = await Auth0Helpers.getOrgMembers(orgId);
  return invitations;
}
