import { FdrAPI } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { provideRegistryService } from "@fern-ui/ui";
import type { Redirect } from "next/types";
import urlJoin from "url-join";
import { getAuthorizationUrl } from "./auth/workos";

export async function getUnauthenticatedRedirect(xFernHost: string, path: string): Promise<Redirect> {
    const authorizationUrl = getAuthorizationUrl(
        {
            organization: await maybeGetWorkosOrganization(xFernHost),
            state: urlJoin(withDefaultProtocol(xFernHost), path),
        },
        xFernHost,
    );
    return { destination: authorizationUrl, permanent: false };
}

async function maybeGetWorkosOrganization(host: string): Promise<string | undefined> {
    const docsV2ReadClient = provideRegistryService().docs.v2.read;
    const maybeFernOrgId = await docsV2ReadClient.getOrganizationForUrl({ url: FdrAPI.Url(host) });
    if (!maybeFernOrgId.ok) {
        return undefined;
    }
    const fernOrgId = maybeFernOrgId.body;
    const venusOrgClient = new FernVenusApiClient({
        environment: process.env.NEXT_PUBLIC_VENUS_ORIGIN ?? "https://venus.buildwithfern.com",
    }).organization;
    const maybeOrg = await venusOrgClient.get(FernVenusApi.OrganizationId(fernOrgId));
    if (!maybeOrg.ok) {
        return undefined;
    }
    return maybeOrg.body.workosOrganizationId;
}
