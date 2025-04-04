import {
  GetInvitations200ResponseOneOfInner,
  GetMembers200ResponseOneOfInner,
  GetOrganizations200ResponseOneOfInner,
  GetUsers200ResponseOneOfInner,
} from "auth0";

import { Auth0OrgID, Auth0UserID } from "../auth0/types";

export type RedisCacheKey<T extends RedisCacheKeyType> = string & {
  __type: T;
};

export const RedisCacheKeyType = {
  USER: "USER",
  ORGANIZATION: "ORGANIZATION",
  MY_ORGANIZATIONS: "MY_ORGANIZATIONS",
  ORGANIZATION_MEMBERS: "ORGANIZATION_MEMBERS",
  ORGANIZATION_INVITATIONS: "ORGANIZATION_INVITATIONS",
} as const;

export type RedisCacheKeyType =
  (typeof RedisCacheKeyType)[keyof typeof RedisCacheKeyType];

export type RedisCacheDataTypes = {
  [RedisCacheKeyType.USER]: GetUsers200ResponseOneOfInner;
  [RedisCacheKeyType.ORGANIZATION]: GetOrganizations200ResponseOneOfInner;
  [RedisCacheKeyType.MY_ORGANIZATIONS]: GetOrganizations200ResponseOneOfInner[];
  [RedisCacheKeyType.ORGANIZATION_MEMBERS]: GetMembers200ResponseOneOfInner[];
  [RedisCacheKeyType.ORGANIZATION_INVITATIONS]: GetInvitations200ResponseOneOfInner[];
};

export const RedisCacheKey = {
  user: (userId: Auth0UserID) =>
    cacheKey(RedisCacheKeyType.USER)(`user-${userId}`),
  organization: (orgId: Auth0OrgID) =>
    cacheKey(RedisCacheKeyType.ORGANIZATION)(`org-${orgId}`),
  myOrganizations: (userId: Auth0UserID) =>
    cacheKey(RedisCacheKeyType.MY_ORGANIZATIONS)(`my-orgs-${userId}`),
  organizationMembers: (orgId: Auth0OrgID) =>
    cacheKey(RedisCacheKeyType.ORGANIZATION_MEMBERS)(`org-members-${orgId}`),
  organizationInvitations: (orgId: Auth0OrgID) =>
    cacheKey(RedisCacheKeyType.ORGANIZATION_INVITATIONS)(
      `org-invitations-${orgId}`
    ),
};

function cacheKey<T extends RedisCacheKeyType>(_type: T) {
  return (key: string) => key as unknown as RedisCacheKey<T>;
}

export type inferCachedData<T extends RedisCacheKeyType> =
  RedisCacheDataTypes[T];
