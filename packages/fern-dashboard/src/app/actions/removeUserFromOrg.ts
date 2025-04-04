"use server";

import { getCurrentSession } from "../services/auth0/getCurrentSession";
import {
  ensureUserBelongsToOrg,
  getAuth0ManagementClient,
  invalidateCachesAfterAddingOrRemovingOrgMember,
} from "../services/auth0/management";
import { Auth0UserID } from "../services/auth0/types";

export async function removeUserFromOrg({
  userIdToRemove,
}: {
  userIdToRemove: Auth0UserID;
}) {
  const auth0 = getAuth0ManagementClient();
  const { userId, orgId } = await getCurrentSession();
  await ensureUserBelongsToOrg(userId, orgId);

  if (userId === userIdToRemove) {
    throw new Error("User cannot remove themself");
  }

  await auth0.organizations.deleteMembers(
    { id: orgId },
    { members: [userIdToRemove] }
  );

  await invalidateCachesAfterAddingOrRemovingOrgMember({
    userId,
    orgId,
  });
}
