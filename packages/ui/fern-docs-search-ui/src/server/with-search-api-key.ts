import { getSearchApiKey } from "@fern-ui/fern-docs-search-server";
import { algoliasearch } from "algoliasearch";

interface WithSearchApiKeyOptions {
    appId: string;
    adminApiKey: string;
    parentApiKey: string;
    domain: string;
    roles: string[];
    authed: boolean;
}

export function withSearchApiKey({ appId, adminApiKey, parentApiKey, domain, roles, authed }: WithSearchApiKeyOptions) {
    return getSearchApiKey({
        client: algoliasearch(appId, adminApiKey),
        parentApiKey,
        domain,
        roles,
        authed,
        expiresInSeconds: 60 * 60 * 24,
        searchIndex: "fern-docs-search",
    });
}
