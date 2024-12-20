import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { algoliaAppId, algoliaSearchApikey } from "@/server/env-variables";
import { selectFirst } from "@/server/utils/selectFirst";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import {
    DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
    SEARCH_INDEX,
    getSearchApiKey,
} from "@fern-ui/fern-docs-search-server/algolia";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-ui/fern-docs-utils";
import { NextApiRequest, NextApiResponse } from "next";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).send("Method not allowed");
    }

    const domain = getDocsDomainNode(req);

    const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
    if (orgMetadata == null) {
        return res.status(404).send("Not found");
    }

    if (orgMetadata.isPreviewUrl) {
        return res.status(400).send("Search is not supported for preview URLs");
    }

    const fern_token = req.cookies[COOKIE_FERN_TOKEN];
    const user = await safeVerifyFernJWTConfig(fern_token, await getAuthEdgeConfig(domain));

    const userToken = getXUserToken(req) ?? user?.api_key ?? fern_token;

    const apiKey = getSearchApiKey({
        parentApiKey: algoliaSearchApikey(),
        domain: withoutStaging(domain),
        roles: user?.roles ?? [],
        authed: user != null,
        expiresInSeconds: DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
        searchIndex: SEARCH_INDEX,
        userToken,
    });

    return res.status(200).setHeader("Cache-Control", "no-store").json({
        appId: algoliaAppId(),
        apiKey,
    });
}

function getXUserToken(req: NextApiRequest): string | undefined {
    return selectFirst(req.headers["X-User-Token"]);
}
