/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ApiResponse,
  GetInvitations200ResponseOneOfInner,
  GetMembers200ResponseOneOfInner,
  ManagementClient,
} from "auth0";

import { AsyncRedisCache } from "../redis/AsyncRedisCache";
import { RedisCacheKey, RedisCacheKeyType } from "../redis/cacheKey";
import { Auth0OrgID, Auth0UserID } from "./types";

/****************************
 * getAuth0ManagementClient *
 ****************************/

let AUTH0_MANAGEMENT_CLIENT: ManagementClient | undefined;

export function getAuth0ManagementClient() {
  if (AUTH0_MANAGEMENT_CLIENT == null) {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

    if (AUTH0_DOMAIN == null) {
      throw new Error("AUTH0_DOMAIN is not defined");
    }
    if (AUTH0_CLIENT_ID == null) {
      throw new Error("AUTH0_CLIENT_ID is not defined");
    }
    if (AUTH0_CLIENT_SECRET == null) {
      throw new Error("AUTH0_CLIENT_SECRET is not defined");
    }

    AUTH0_MANAGEMENT_CLIENT = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    });
  }

  return AUTH0_MANAGEMENT_CLIENT;
}

/**********
 * caches *
 **********/

const ORGANIZATIONS_CACHE = new AsyncRedisCache(
  RedisCacheKeyType.ORGANIZATION,
  { ttlInSeconds: 10 }
);

const MY_ORGANIZATIONS_CACHE = new AsyncRedisCache(
  RedisCacheKeyType.MY_ORGANIZATIONS,
  { ttlInSeconds: 10 }
);

const ORGANIZATION_MEMBERS_CACHE = new AsyncRedisCache(
  RedisCacheKeyType.ORGANIZATION_MEMBERS,
  { ttlInSeconds: 10 }
);

const ORGANIZATION_INVITATIONS_CACHE = new AsyncRedisCache(
  RedisCacheKeyType.ORGANIZATION_INVITATIONS,
  { ttlInSeconds: 10 }
);

/**********************
 * cache invalidators *
 **********************/

export async function invalidateCachesAfterAddingOrRemovingOrgMember({
  userId,
  orgId,
}: {
  userId: Auth0UserID;
  orgId: Auth0OrgID;
}) {
  await Promise.all([
    MY_ORGANIZATIONS_CACHE.invalidate(RedisCacheKey.myOrganizations(userId)),
    ORGANIZATION_MEMBERS_CACHE.invalidate(
      RedisCacheKey.organizationMembers(orgId)
    ),
  ]);
}

export async function invalidateCachesAfterInvitingUserToOrg(
  orgId: Auth0OrgID
) {
  await ORGANIZATION_INVITATIONS_CACHE.invalidate(
    RedisCacheKey.organizationInvitations(orgId)
  );
}

export async function invalidateCachesAfterRescindingInvitation(
  orgId: Auth0OrgID
) {
  await ORGANIZATION_INVITATIONS_CACHE.invalidate(
    RedisCacheKey.organizationInvitations(orgId)
  );
}

export async function invalidateCachesAfterAcceptingInvitation({
  userId,
  orgId,
}: {
  userId: Auth0UserID;
  orgId: Auth0OrgID;
}) {
  await Promise.all([
    MY_ORGANIZATIONS_CACHE.invalidate(RedisCacheKey.myOrganizations(userId)),
    ORGANIZATION_MEMBERS_CACHE.invalidate(
      RedisCacheKey.organizationMembers(orgId)
    ),
    ORGANIZATION_INVITATIONS_CACHE.invalidate(
      RedisCacheKey.organizationInvitations(orgId)
    ),
  ]);
}

/***********
 * helpers *
 ***********/

export async function getOrganization(orgId: Auth0OrgID) {
  return await ORGANIZATIONS_CACHE.get(
    RedisCacheKey.organization(orgId),
    async () => {
      const { data: organization } =
        await getAuth0ManagementClient().organizations.get({
          id: orgId,
        });

      return organization;
    }
  );
}

export async function getMyOrganizations(userId: Auth0UserID) {
  return await MY_ORGANIZATIONS_CACHE.get(
    RedisCacheKey.myOrganizations(userId),
    async () => {
      const { data: organizations } =
        await getAuth0ManagementClient().users.getUserOrganizations({
          id: userId,
        });

      return organizations;
    }
  );
}

export async function getOrgMembers(
  orgId: Auth0OrgID,
  { includeFernEmployees }: { includeFernEmployees: boolean }
) {
  let members = await ORGANIZATION_MEMBERS_CACHE.get(
    RedisCacheKey.organizationMembers(orgId),
    () => getAllOrgMembers(orgId)
  );
  if (!includeFernEmployees) {
    const isFernEmployee = await createIsFernEmployee();
    members = members.filter(
      (member) => !isFernEmployee(Auth0UserID(member.user_id))
    );
  }
  return members;
}

async function getAllOrgMembers(orgId: Auth0OrgID) {
  const members: GetMembers200ResponseOneOfInner[] = [];

  const auth0 = getAuth0ManagementClient();

  let pageIndex = 0;
  let page: ApiResponse<GetMembers200ResponseOneOfInner[]>;
  do {
    page = await auth0.organizations.getMembers({
      id: orgId,
      page: pageIndex,
      per_page: 100,
      fields: "user_id,picture,name,email,roles",
    });
    members.push(...page.data);
    pageIndex++;
  } while (
    page.data.length > 0 &&
    // the auth0 API only supports loading 1,000 users via basic pagination
    members.length < 1000
  );

  members.sort((a, b) => (a.name < b.name ? -1 : 1));

  return members;
}

export async function createIsFernEmployee(): Promise<
  (userId: Auth0UserID) => boolean
> {
  const fernOrgMembers = await getOrgMembers(getFernAuth0OrgID(), {
    includeFernEmployees: true,
  });
  const fernMembers = new Set(
    fernOrgMembers.map((member) => Auth0UserID(member.user_id))
  );
  return (userId: Auth0UserID) => fernMembers.has(Auth0UserID(userId));
}

function getFernAuth0OrgID(): Auth0OrgID {
  if (process.env.FERN_AUTH0_ORG_ID == null) {
    throw new Error("FERN_AUTH0_ORG_ID is not defined in the environment");
  }
  return Auth0OrgID(process.env.FERN_AUTH0_ORG_ID);
}

export async function getOrgInvitations(orgId: Auth0OrgID) {
  return await ORGANIZATION_INVITATIONS_CACHE.get(
    RedisCacheKey.organizationInvitations(orgId),
    () => getAllOrgInvitations(orgId)
  );
}

async function getAllOrgInvitations(orgId: Auth0OrgID) {
  const invitations: GetInvitations200ResponseOneOfInner[] = [];

  const auth0 = getAuth0ManagementClient();

  let pageIndex = 0;
  let page: ApiResponse<GetInvitations200ResponseOneOfInner[]>;
  do {
    page = await auth0.organizations.getInvitations({
      id: orgId,
      page: pageIndex,
      per_page: 100,
    });
    invitations.push(...page.data);
    pageIndex++;
  } while (
    page.data.length > 0 &&
    // the auth0 API only supports loading 1,000 invitations via basic pagination
    invitations.length < 1000
  );

  invitations.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return invitations;
}

export async function ensureUserBelongsToOrg(
  userId: Auth0UserID,
  orgId: Auth0OrgID
) {
  if (!(await doesUserBelongsToOrg(userId, orgId))) {
    throw new Error(`User ${userId} is not in org ${orgId}`);
  }
}

export async function doesUserBelongsToOrg(
  userId: Auth0UserID,
  orgId: Auth0OrgID
) {
  const orgMembers = await getOrgMembers(orgId, { includeFernEmployees: true });
  return orgMembers.some((member) => member.user_id === userId);
}
