"use server";

import { getAuth0ClientId } from "../services/auth0/auth0";
import { getCurrentSession } from "../services/auth0/getCurrentSession";
import {
  ensureUserBelongsToOrg,
  getAuth0ManagementClient,
} from "../services/auth0/management";

export async function inviteUserToOrg({
  inviteeEmail,
}: {
  inviteeEmail: string;
}) {
  const auth0 = getAuth0ManagementClient();
  const { session, userId, orgId } = await getCurrentSession();
  await ensureUserBelongsToOrg(userId, orgId);

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
