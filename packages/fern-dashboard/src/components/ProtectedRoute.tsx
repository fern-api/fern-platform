import { redirect } from "next/navigation";
import React from "react";

import { createPersonalProject } from "@/app/actions/createPersonalProject";
import { getMyOrganizations } from "@/app/actions/getMyOrganizations";
import { auth0 } from "@/lib/auth0";

export declare namespace ProtectedRoute {
  export interface Props {
    children: React.JSX.Element;
  }
}

export const ProtectedRoute = async ({ children }: ProtectedRoute.Props) => {
  const session = await auth0.getSession();

  if (session == null) {
    redirect("/");
  }

  const orgId = session.user.org_id;
  const organizations = await getMyOrganizations();

  if (!organizations.some((o) => o.id === orgId)) {
    let orgIdToRedirectTo = organizations[0]?.id;
    if (orgIdToRedirectTo == null) {
      orgIdToRedirectTo = await createPersonalProject();
    }

    redirect(`/auth/login?organization=${orgIdToRedirectTo}`);
  }

  return children;
};
