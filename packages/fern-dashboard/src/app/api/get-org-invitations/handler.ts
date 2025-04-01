import * as auth0Management from "@/app/services/auth0/management";
import { Auth0OrgID } from "@/app/services/auth0/types";

export default async function getOrgInvitations(orgId: Auth0OrgID) {
  const invitations = await auth0Management.getOrgInvitations(orgId);
  return invitations;
}
