"use server";

import { getAuth0ManagementClient } from "../services/auth0/getAuth0ManagementClient";
import { getCurrentSession } from "../services/auth0/getCurrentSession";
import { getOrgMembers } from "../services/auth0/helpers";
import { Auth0OrgID } from "../services/auth0/types";

/* eslint-disable turbo/no-undeclared-env-vars */

export async function inviteUserToOrg({
  orgId,
  inviteeEmail,
}: {
  // include orgId on the request to avoid race conditions if the org is
  // changed, i.e. ensure that we are adding the org that the user was looking
  // at on the frontend
  orgId: Auth0OrgID;
  inviteeEmail: string;
}) {
  const auth0 = getAuth0ManagementClient();
  const { session, userId } = await getCurrentSession();

  const orgMembers = await getOrgMembers(orgId);
  if (!orgMembers.some((member) => member.user_id === userId)) {
    throw new Error(`User ${userId} is not in org ${orgId}`);
  }

  await auth0.organizations.createInvitation(
    { id: orgId },
    {
      inviter: { name: session.user.name ?? "" },
      invitee: { email: inviteeEmail },
      client_id: getAuth0ClientId(),
      send_invitation_email: true,
    }
  );
}

function getAuth0ClientId() {
  if (process.env.AUTH0_CLIENT_ID == null) {
    throw new Error(
      "AUTH0_CLIENT_ID is not defined in the current environment"
    );
  }
  return process.env.AUTH0_CLIENT_ID;
}
