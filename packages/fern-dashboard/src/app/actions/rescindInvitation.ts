"use server";

import { getAuth0ManagementClient } from "../services/auth0/management";
import { Auth0OrgID } from "../services/auth0/types";

export async function rescindInvitation({
  orgId,
  invitationId,
}: {
  orgId: Auth0OrgID;
  invitationId: string;
}) {
  await getAuth0ManagementClient().organizations.deleteInvitation({
    id: orgId,
    invitation_id: invitationId,
  });
}
