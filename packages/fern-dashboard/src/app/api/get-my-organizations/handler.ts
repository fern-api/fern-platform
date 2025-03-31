import { getAuth0ManagementClient } from "@/app/services/auth0/getAuth0ManagementClient";
import { Auth0UserID } from "@/app/services/auth0/types";

export default async function getMyOrganizations(userId: Auth0UserID) {
  const { data: organizations } =
    await getAuth0ManagementClient().users.getUserOrganizations({
      id: userId,
    });

  return organizations;
}
