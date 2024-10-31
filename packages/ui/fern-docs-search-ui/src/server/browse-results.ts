import { browseAllObjectsForFilters, createSearchFilters } from "@fern-ui/fern-docs-search-server/algolia";
import { algoliasearch } from "algoliasearch";
import { algoliaAppId, algoliaWriteApiKey } from "./env-variables";

export interface NavigationRecord {
    icon?: string;
    title: string;
    pathname: string;
}

export interface InitialResultsResponse {
    tabs: NavigationRecord[];
    products: NavigationRecord[];
    versions: NavigationRecord[];
}

export async function browseInitialResults(domain: string): Promise<InitialResultsResponse> {
    const client = algoliasearch(algoliaAppId(), algoliaWriteApiKey());

    const tabs = new Map<string, { icon?: string; title: string; pathname: string }>();
    const products = new Map<string, { icon?: string; title: string; pathname: string }>();
    const versions = new Map<string, { icon?: string; title: string; pathname: string }>();

    const response = await browseAllObjectsForFilters(
        client,
        createSearchFilters({ domain, roles: [], authed: false }) + " AND type:navigation",
        "fern-docs-search",
        ["pathname", "node_type", "title", "icon"],
        true,
    );

    response.forEach((record) => {
        if (record.title != null && record.pathname != null) {
            if (
                record.node_type === "page" ||
                record.node_type === "endpoint" ||
                record.node_type === "changelogEntry"
            ) {
                return;
            }

            const r: NavigationRecord = {
                title: record.title,
                pathname: record.pathname,
                icon: record.icon,
            };

            if (record.node_type === "tab") {
                // TODO: this should be segmented by product and version
                tabs.set(record.pathname, r);
            } else if (record.node_type === "product") {
                products.set(record.pathname, r);
            } else if (record.node_type === "version") {
                // TODO: this should be segmented by product
                versions.set(record.pathname, r);
            }
        }
    });

    return {
        tabs: Array.from(tabs.values()),
        products: Array.from(products.values()),
        versions: Array.from(versions.values()),
    };
}
