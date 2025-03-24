"use server";

import { GetOrganizations200ResponseOneOfInner } from "auth0";

import { AsyncCache } from "./AsyncCache";
import { getAuth0ManagementClient, getCurrentSession } from "./auth0";
import { Auth0UserID } from "./types";

const MY_ORGANIZATIONS_CACHE = new AsyncCache<
  Auth0UserID,
  GetOrganizations200ResponseOneOfInner[]
>({
  ttlInSeconds: 10,
});

export async function getMyOrganizations() {
  const { userId } = await getCurrentSession();

  return MY_ORGANIZATIONS_CACHE.get(userId, async () => {
    const { data: organizations } =
      await getAuth0ManagementClient().users.getUserOrganizations({
        id: userId,
      });
    return organizations;
  });
}
