import { getSearchApiKey } from "@fern-ui/fern-docs-search-server/algolia";

interface WithSearchApiKeyOptions {
    searchApiKey: string;
    domain: string;
    roles: string[];
    authed: boolean;
    userToken: string;
}

export function withSearchApiKey({ searchApiKey, domain, roles, authed, userToken }: WithSearchApiKeyOptions): string {
    return getSearchApiKey({
        parentApiKey: searchApiKey,
        domain,
        roles,
        authed,
        expiresInSeconds: 60 * 60 * 24,
        searchIndex: "fern-docs-search",
        userToken,
    });
}
