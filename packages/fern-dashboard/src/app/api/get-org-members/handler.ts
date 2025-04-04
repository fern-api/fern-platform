import * as auth0Management from "@/app/services/auth0/management";
import { Auth0OrgID, Auth0UserID } from "@/app/services/auth0/types";

export default async function getOrgMembers({
  userId,
  orgId,
}: {
  userId: Auth0UserID;
  orgId: Auth0OrgID;
}) {
  const user = await auth0Management.getUser(userId);
  const members = await auth0Management.getOrgMembers(orgId, {
    includeFernEmployees: user.email.endsWith("@buildwithfern.com"),
  });
  return members;
}
