import { getSearchApiKey } from "@fern-ui/fern-docs-search-server/algolia";
import { algoliasearch } from "algoliasearch";

interface WithSearchApiKeyOptions {
    appId: string;
    writeApiKey: string;
    searchApiKey: string;
    domain: string;
    roles: string[];
    authed: boolean;
}

export function withSearchApiKey({ appId, writeApiKey, searchApiKey, domain, roles, authed }: WithSearchApiKeyOptions) {
    return getSearchApiKey({
        client: algoliasearch(appId, writeApiKey),
        parentApiKey: searchApiKey,
        domain,
        roles,
        authed,
        expiresInSeconds: 60 * 60 * 24,
        searchIndex: "fern-docs-search",
    });
}
