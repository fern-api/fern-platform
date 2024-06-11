import { getEnvVar } from "@/utils";
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { Organization, OrganizationId } from "@fern-api/venus-api-sdk/api";
import { getAPIResponse } from "./fern";

export function getVenusClient({ token }: { token: string }) {
    return new FernVenusApiClient({
        environment: getEnvVar("VENUS_ORIGIN", "https://venus-dev2.buildwithfern.com"),
        token,
    });
}

export async function getOrganization(client: FernVenusApiClient, orgId: string): Promise<Organization | undefined> {
    return getAPIResponse(await client.organization.get(OrganizationId(orgId)));
}
