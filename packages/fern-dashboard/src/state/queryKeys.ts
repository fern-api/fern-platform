import { getMyDocsSites } from "@/app/api/get-my-docs-sites/route";
import { getMyOrganizations } from "@/app/api/get-my-organizations/route";
import { getOrgMembers } from "@/app/api/get-org-members/route";
import { getHomepageImageUrl } from "@/app/api/homepage-images/get/route";
import { Theme } from "@/app/api/homepage-images/types";
import { DocsUrl } from "@/utils/types";

import { OrgInvitation } from "./types";

export type ReactQueryKey<T> = string[] & { __queryData: Awaited<T> };

export const ReactQueryKey = {
  // orgId isn't needed in the queryKeys because when we switch orgs we
  // do a hard redirect which resets all client-side state

  orgInvitations: () => queryKey<OrgInvitation[]>("org-invitations"),
  orgMembers: () => queryKey<getOrgMembers.Response[]>("org-members"),
  myDocsSites: (): ReactQueryKey<getMyDocsSites.Response> =>
    queryKey<getMyDocsSites.Response>("my-docs-sites"),
  myOrganizations: () => queryKey<getMyOrganizations.Response>("my-orgs"),
  homepageImageUrl: ({ docsUrl, theme }: { docsUrl: DocsUrl; theme: Theme }) =>
    queryKey<getHomepageImageUrl.Response>(
      "homepage-image-url",
      docsUrl,
      theme
    ),
} as const;

function queryKey<T>(...key: string[]) {
  const frozenKey = Object.freeze(key);
  return frozenKey as ReactQueryKey<T>;
}

export type inferQueryData<K> = K extends ReactQueryKey<infer T> ? T : never;
