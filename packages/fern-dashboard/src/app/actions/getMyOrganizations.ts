"use server";

import { AUTH0_MANAGEMENT_CLIENT, getCurrentSession } from "./auth0";

export async function getMyOrganizations() {
  const { userId } = await getCurrentSession();

  const { data: organizations } =
    await AUTH0_MANAGEMENT_CLIENT.users.getUserOrganizations({
      id: userId,
    });

  return organizations;
}
