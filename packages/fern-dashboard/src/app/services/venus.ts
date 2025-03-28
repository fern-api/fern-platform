/* eslint-disable turbo/no-undeclared-env-vars */
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";

export function getVenusClient({
  token,
}: {
  token: string;
}): FernVenusApiClient {
  if (process.env.VENUS_SERVER_URL == null) {
    throw new Error(
      "VENUS_SERVER_URL is not defined in the current environment"
    );
  }
  return new FernVenusApiClient({
    environment: process.env.VENUS_SERVER_URL,
    token,
  });
}

export async function isMemberOf(
  venus: FernVenusApiClient,
  orgId: FernVenusApi.OrganizationId
): Promise<boolean> {
  let nextPageId: number | undefined = 0;

  do {
    const page = await venus.user.getMyOrganizations({ pageId: nextPageId });
    if (!page.ok) {
      console.error("Failed to load organizations page", page.error);
      throw new Error("Failed to load organizations page");
    }
    if (page.body.organizations.includes(orgId)) {
      return true;
    }
    nextPageId = page.body.nextPage;
  } while (nextPageId != null);

  return false;
}

export async function getAllMyOrganizations(
  venus: FernVenusApiClient
): Promise<FernVenusApi.OrganizationId[]> {
  const orgIds: FernVenusApi.OrganizationId[] = [];

  let nextPageId: number | undefined = 0;

  do {
    const page = await venus.user.getMyOrganizations({ pageId: nextPageId });
    if (!page.ok) {
      console.error("Failed to load organizations page", page.error);
      throw new Error("Failed to load organizations page");
    }
    orgIds.push(...page.body.organizations);
    nextPageId = page.body.nextPage;
  } while (nextPageId != null);

  return orgIds;
}
