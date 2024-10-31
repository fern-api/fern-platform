import { browseAllObjectsForFilters, createSearchFilters } from "@fern-ui/fern-docs-search-server/algolia";
import { algoliasearch } from "algoliasearch";
import { algoliaAppId, algoliaWriteApiKey } from "./env-variables";

export async function browseInitialResults(domain: string): Promise<{
    products: { id: string; title: string; pathname: string }[];
    versions: { id: string; title: string; pathname: string }[];
    tabs: { title: string; pathname: string }[];
}> {
    const client = algoliasearch(algoliaAppId(), algoliaWriteApiKey());

    const tabs = new Map<string, { title: string; pathname: string }>();
    const products = new Map<string, { id: string; title: string; pathname: string }>();
    const versions = new Map<string, { id: string; title: string; pathname: string }>();

    const response = await browseAllObjectsForFilters(
        client,
        createSearchFilters({ domain, roles: [], authed: false }),
        "fern-docs-search",
        ["tab", "product", "version"],
        true,
    );

    response.forEach((record) => {
        if (record.tab && record.tab.pathname && record.tab.title) {
            tabs.set(record.tab.pathname, {
                title: record.tab.title,
                pathname: record.tab.pathname,
            });
        }
        if (record.product && record.product.pathname && record.product.title && record.product.id) {
            products.set(record.product.pathname, {
                id: record.product.id,
                title: record.product.title,
                pathname: record.product.pathname,
            });
        }
        if (record.version && record.version.pathname && record.version.title && record.version.id) {
            versions.set(record.version.pathname, {
                id: record.version.id,
                title: record.version.title,
                pathname: record.version.pathname,
            });
        }
    });

    return {
        tabs: Array.from(tabs.values()),
        products: Array.from(products.values()),
        versions: Array.from(versions.values()),
    };
}
