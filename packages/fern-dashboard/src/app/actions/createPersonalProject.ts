"use server";

import { AUTH0_MANAGEMENT_CLIENT, getCurrentSession } from "./auth0";

export async function createPersonalProject() {
  const { session, userId } = await getCurrentSession();

  const { data: organization } =
    await AUTH0_MANAGEMENT_CLIENT.organizations.create({
      name: `${userId.replace("|", "-")}-personal-project`,
      display_name: `${session.user.name}'s Personal Project`,
      enabled_connections: [{ connection_id: "con_Z6Dd06NADtkpPpLZ" }],
      metadata: {
        isPersonalProject: "true",
      },
    });

  await AUTH0_MANAGEMENT_CLIENT.organizations.addMembers(
    { id: organization.id },
    { members: [userId] }
  );

  return organization.id;
}
