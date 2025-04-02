import * as auth0Management from "@/app/services/auth0/management";
import { Auth0UserID } from "@/app/services/auth0/types";

export default async function getMyOrganizations(userId: Auth0UserID) {
  return await auth0Management.getMyOrganizations(userId);
}
