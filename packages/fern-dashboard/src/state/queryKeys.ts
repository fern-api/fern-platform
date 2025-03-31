import {
  GetMembers200ResponseOneOfInner,
  GetOrganizations200ResponseOneOfInner,
} from "auth0";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { OrgInvitation } from "./types";

export type ReactQueryKey<T> = string[] & { __queryData: T };

export const ReactQueryKey = {
  orgInvitations: () => queryKey("org-invitations")<OrgInvitation[]>(),
  orgMembers: () =>
    queryKey("org-members")<GetMembers200ResponseOneOfInner[]>(),
  myDocsSites: () =>
    queryKey("my-docs-sites")<FdrAPI.dashboard.GetDocsSitesForOrgResponse>(),
  organizations: () =>
    queryKey("orgs")<GetOrganizations200ResponseOneOfInner[]>(),
} as const;

function queryKey(...key: string[]) {
  const frozenKey = Object.freeze(key);
  return <T>() => frozenKey as ReactQueryKey<T>;
}

export type inferQueryData<K> = K extends ReactQueryKey<infer T> ? T : never;
