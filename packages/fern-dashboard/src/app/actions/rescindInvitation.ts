"use server";

import { getCurrentSession } from "../services/auth0/getCurrentSession";
import {
  ensureUserBelongsToOrg,
  getAuth0ManagementClient,
} from "../services/auth0/management";

export async function rescindInvitation({
  invitationId,
}: {
  invitationId: string;
}) {
  const { userId, orgId } = await getCurrentSession();
  await ensureUserBelongsToOrg(userId, orgId);

  const auth0 = getAuth0ManagementClient();
  await auth0.organizations.deleteInvitation({
    id: orgId,
    invitation_id: invitationId,
  });
}
