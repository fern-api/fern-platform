"use server";

import { getAuth0ManagementClient, getCurrentSession } from "./auth0";

export async function getMyOrganizations() {
  const { userId } = await getCurrentSession();

  const { data: organizations } =
    await getAuth0ManagementClient().users.getUserOrganizations({
      id: userId,
    });

  return organizations;
}
