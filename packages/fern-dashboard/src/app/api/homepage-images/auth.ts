import { NextResponse } from "next/server";

import { FernVenusApi } from "@fern-api/venus-api-sdk";

import * as auth0Management from "@/app/services/auth0/management";
import { Auth0OrgID } from "@/app/services/auth0/types";
import { getVenusClient } from "@/app/services/venus/getVenusClient";

import { MaybeErrorResponse } from "../utils/MaybeErrorResponse";
import { getDocsUrlOwner } from "../utils/getDocsUrlMetadata";

export async function ensureUserOwnsUrl({
  token,
  url,
}: {
  token: string;
  url: string;
}): Promise<MaybeErrorResponse> {
  const owner = await getDocsUrlOwner({ url, token });

  const isMember = await getVenusClient({ token }).organization.isMember(
    FernVenusApi.OrganizationId(owner.orgName)
  );
  if (!isMember.ok) {
    console.error(
      "Failed to load org membership for user",
      JSON.stringify(isMember.error)
    );
    throw new Error("Failed to load org membership for user");
  }
  if (!isMember.body) {
    return {
      errorResponse: NextResponse.json(
        { error: "User does not have access to url" },
        { status: 403 }
      ),
    };
  }

  return { data: undefined };
}

export async function ensureOrgOwnsUrl({
  token,
  url,
  orgId,
}: {
  token: string;
  url: string;
  orgId: Auth0OrgID;
}): Promise<MaybeErrorResponse> {
  const org = await auth0Management.getOrganization(orgId);

  const owner = await getDocsUrlOwner({ url, token });

  if (owner.orgName !== org.name) {
    console.error(
      `Org ${orgId} does not own URL ${url} (it is owned by ${owner.orgName})`
    );
    return {
      errorResponse: NextResponse.json(
        { message: `Org ${org.name} does not own URL ${url}` },
        { status: 401 }
      ),
    };
  }
  return { data: undefined };
}
