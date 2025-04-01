import { redirect } from "next/navigation";
import React from "react";

import { createPersonalProject } from "@/app/actions/createPersonalProject";
import getMyOrganizations from "@/app/api/get-my-organizations/handler";
import { getAuth0Client } from "@/app/services/auth0/auth0";
import { Auth0OrgID, Auth0UserID } from "@/app/services/auth0/types";
import { getLoginUrl } from "@/utils/getLoginUrl";

export declare namespace ProtectedRoute {
  export interface Props {
    children: React.JSX.Element;
  }
}

export const ProtectedRoute = async ({ children }: ProtectedRoute.Props) => {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();

  if (session == null) {
    redirect("/");
  }

  const orgId = session.user.org_id;

  const organizations = await getMyOrganizations(Auth0UserID(session.user.sub));
  const currentOrg = organizations.find((org) => org.id === orgId);

  if (currentOrg == null) {
    let orgIdToRedirectTo = organizations[0]?.id;
    if (orgIdToRedirectTo == null) {
      orgIdToRedirectTo = await createPersonalProject();
    }

    redirect(
      getLoginUrl({
        orgId: Auth0OrgID(orgIdToRedirectTo),
      })
    );
  }

  return children;
};
