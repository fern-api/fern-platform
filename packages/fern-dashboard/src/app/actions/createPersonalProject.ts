"use server";

import { User } from "@auth0/nextjs-auth0/types";

import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { APIResponse } from "@fern-api/venus-api-sdk/core";

import { getCurrentSession } from "../services/auth0/getCurrentSession";
import { Auth0OrgID, Auth0UserID } from "../services/auth0/types";
import { getVenusClient } from "../services/venus/getVenusClient";

export async function createPersonalProject(): Promise<Auth0OrgID> {
  const { session, userId } = await getCurrentSession();
  const venus = getVenusClient({ token: session.tokenSet.accessToken });

  const orgId = await createPersonalProjectInVenus({
    userId,
    userName: getUserName(session.user),
    venus,
  });

  return Auth0OrgID(orgId);
}

async function createPersonalProjectInVenus({
  userId,
  userName,
  venus,
}: {
  userId: Auth0UserID;
  userName: string | undefined;
  venus: FernVenusApiClient;
}) {
  let createOrgResponse: APIResponse<
    FernVenusApi.CreateOrganizationResponse,
    FernVenusApi.organization.create.Error
  >;
  let attempt = 0;

  do {
    createOrgResponse = await venus.organization.create({
      organizationId: FernVenusApi.OrganizationId(
        getPersonalProjectOrgId({ userId, userName, attempt: attempt++ })
      ),
      enableGithubConnection: true,
    });
  } while (
    !createOrgResponse.ok &&
    createOrgResponse.error.error === "OrganizationAlreadyExistsError"
  );

  if (!createOrgResponse.ok) {
    console.error("Failed to create organization", createOrgResponse.error);
    throw new Error("Failed to create organization");
  }

  return createOrgResponse.body.organizationId;
}

function getPersonalProjectOrgId({
  userId,
  userName,
  attempt,
}: {
  userId: Auth0UserID;
  userName: string | undefined;
  attempt: number;
}) {
  let orgId = `${userName ?? userId}-personal-project`
    .replaceAll(" ", "-")
    .toLowerCase();
  if (attempt > 0) {
    orgId += `-${attempt}`;
  }
  return orgId;
}

function getUserName(user: User) {
  if (user.name != null) {
    return user.name;
  }
  if (user.given_name != null && user.family_name != null) {
    return `${user.given_name} ${user.family_name}`;
  }
  return user.given_name ?? user.family_name;
}
