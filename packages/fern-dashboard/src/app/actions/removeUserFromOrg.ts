"use server";

import * as auth0Management from "@/app/services/auth0/management";

import { getCurrentSession } from "../services/auth0/getCurrentSession";
import { Auth0UserID } from "../services/auth0/types";

export async function removeUserFromOrg({
  userIdToRemove,
}: {
  userIdToRemove: Auth0UserID;
}) {
  const auth0 = auth0Management.getAuth0ManagementClient();
  const { userId, orgId } = await getCurrentSession();
  await auth0Management.ensureUserBelongsToOrg(userId, orgId);

  if (userId === userIdToRemove) {
    throw new Error("User cannot remove themself");
  }

  const isFernEmployee = await auth0Management.createIsFernEmployee();

  if (!isFernEmployee(userId) && isFernEmployee(userIdToRemove)) {
    throw new Error("Non-fern-employee cannot remove fern-employee");
  }

  await auth0.organizations.deleteMembers(
    { id: orgId },
    { members: [userIdToRemove] }
  );

  await auth0Management.invalidateCachesAfterAddingOrRemovingOrgMember({
    userId,
    orgId,
  });
}
