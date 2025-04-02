import {
  GetMembers200ResponseOneOfInner,
  GetOrganizations200ResponseOneOfInner,
} from "auth0";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { OrgInvitation } from "./types";

export type ReactQueryKey<T> = string[] & { __queryData: T };

export const ReactQueryKey = {
  orgInvitations: () => queryKey<OrgInvitation[]>("org-invitations"),
  orgMembers: () => queryKey<GetMembers200ResponseOneOfInner[]>("org-members"),
  myDocsSites: () =>
    queryKey<FdrAPI.dashboard.GetDocsSitesForOrgResponse>("my-docs-sites"),
  organizations: () =>
    queryKey<GetOrganizations200ResponseOneOfInner[]>("orgs"),
} as const;

function queryKey<T>(...key: string[]) {
  const frozenKey = Object.freeze(key);
  return frozenKey as ReactQueryKey<T>;
}

export type inferQueryData<K> = K extends ReactQueryKey<infer T> ? T : never;
