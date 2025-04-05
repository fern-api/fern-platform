"use client";

import { redirect, usePathname } from "next/navigation";

import { Auth0OrgID } from "@/app/services/auth0/types";
import { useDocsUrlOwner } from "@/state/useDocsUrlOwner";
import { getLoginUrl } from "@/utils/getLoginUrl";
import { DocsUrl } from "@/utils/types";

import { Page404 } from "../Page404";

export declare namespace MaybeNonExistentDocs {
  export interface Props {
    docsUrl: DocsUrl;
    currentOrgId: Auth0OrgID;
  }
}

export function MaybeNonExistentDocs({
  docsUrl,
  currentOrgId,
}: MaybeNonExistentDocs.Props) {
  const pathname = usePathname();
  const owner = useDocsUrlOwner(docsUrl);

  if (
    owner.type === "loaded" &&
    owner.value.orgId != null &&
    owner.value.orgId !== currentOrgId
  ) {
    redirect(
      getLoginUrl({
        orgId: owner.value.orgId,
        returnTo: pathname,
      })
    );
  }

  switch (owner.type) {
    case "notStartedLoading":
    case "loading":
      return null;
    case "loaded":
    case "failed":
      return <Page404 />;
  }
}
