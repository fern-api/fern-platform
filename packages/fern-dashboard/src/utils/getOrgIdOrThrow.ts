import { SessionData } from "@auth0/nextjs-auth0/types";

import { Auth0OrgID } from "@/app/actions/types";

// this is generally safe because all authed routes are wrapped in
// <ProtectedRoute /> which ensures there's an orgId on the session
export function getOrgIdOrThrow(session: SessionData) {
  const orgId = session.user.org_id;
  if (orgId == null) {
    throw new Error("org_id is not present on the current session");
  }
  return orgId as Auth0OrgID;
}
