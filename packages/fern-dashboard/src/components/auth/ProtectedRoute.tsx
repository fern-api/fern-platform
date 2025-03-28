import { redirect } from "next/navigation";
import React from "react";

import { createPersonalProject } from "@/app/actions/createPersonalProject";
import { getMyOrganizations } from "@/app/actions/getMyOrganizations";
import { getAuth0Client } from "@/lib/auth0";

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

  if (orgId == null) {
    const organizations = await getMyOrganizations();
    let orgIdToRedirectTo = organizations[0]?.id;
    if (orgIdToRedirectTo == null) {
      orgIdToRedirectTo = await createPersonalProject();
    }

    redirect(`/auth/login?organization=${orgIdToRedirectTo}`);
  }

  return children;
};
