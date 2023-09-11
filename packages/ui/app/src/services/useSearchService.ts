import algolia, { type SearchClient } from "algoliasearch/lite";
import { useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";

export type SearchService =
    | {
        isAvailable: true;
        client: SearchClient;
        index: string;
    }
    | {
        isAvailable: false;
    };

if (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID == null || process.env.NEXT_PUBLIC_ALGOLIA_API_KEY == null) {
    // TODO: Move this validation elsewhere
    throw new Error("Missing Algolia variables.");
}

const client = algolia(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

export function useSearchService(): SearchService {
    const { docsDefinition } = useDocsContext();
    const { algoliaSearchIndex } = docsDefinition;
    return useMemo(() => {
        if (algoliaSearchIndex) {
            return {
                isAvailable: true,
                index: algoliaSearchIndex,
                client,
            };
        }
        return { isAvailable: false };
    }, [algoliaSearchIndex]);
}
