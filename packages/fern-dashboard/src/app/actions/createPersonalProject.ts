"use server";

import { getAuth0ManagementClient, getCurrentSession } from "./auth0";

export async function createPersonalProject() {
  const { session, userId } = await getCurrentSession();

  const { data: organization } =
    await getAuth0ManagementClient().organizations.create({
      name: `${userId.replace("|", "-")}-personal-project`,
      display_name: `${session.user.name}'s Personal Project`,
      enabled_connections: [{ connection_id: "con_Z6Dd06NADtkpPpLZ" }],
      metadata: {
        isPersonalProject: "true",
      },
    });

  await getAuth0ManagementClient().organizations.addMembers(
    { id: organization.id },
    { members: [userId] }
  );

  return organization.id;
}
