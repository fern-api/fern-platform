"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { isDoneLoading } from "@fern-ui/loadable";

import { Auth0OrgID } from "@/app/services/auth0/types";
import { useDocsUrlOwner } from "@/state/useDocsUrlOwner";
import { getLoginUrl } from "@/utils/getLoginUrl";
import { DocsUrl } from "@/utils/types";

export function useMaybeRedirectToOrgForCurrentDocsUrl({
  docsUrl,
  currentOrgId,
}: {
  docsUrl: DocsUrl;
  currentOrgId: Auth0OrgID;
}) {
  const pathname = usePathname();
  const owner = useDocsUrlOwner(docsUrl);

  const shouldRedirect =
    owner.type === "loaded" &&
    owner.value.orgId != null &&
    owner.value.orgId !== currentOrgId;

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = getLoginUrl({
        orgId: owner.value.orgId,
        returnTo: pathname,
      });
    }
  }, [owner, pathname, shouldRedirect]);

  return {
    willNotRedirect: isDoneLoading(owner) && !shouldRedirect,
  };
}
