import { assertNonNullish } from "@fern-api/ui-core-utils";
import { liteClient as algoliasearch, type LiteClient as SearchClient } from "algoliasearch/lite";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { CURRENT_VERSION_ID_ATOM } from "../../atoms";
import { useSearchConfig } from "../../services/useSearchService";

export function useAlgoliaSearchClient(): [SearchClient, index: string] | undefined {
    const currentVersionId = useAtomValue(CURRENT_VERSION_ID_ATOM);
    const [searchConfig] = useSearchConfig();

    return useMemo(() => {
        if (!searchConfig.isAvailable) {
            return;
        }

        if (searchConfig.algolia.searchApiKey.type === "unversioned") {
            return [
                algoliasearch(searchConfig.algolia.appId, searchConfig.algolia.searchApiKey.value),
                searchConfig.algolia.index,
            ];
        }

        if (searchConfig.algolia.searchApiKey.type === "versioned") {
            assertNonNullish(
                currentVersionId,
                "Inconsistent State: Received search info is versioned but docs are unversioned.",
            );
            const searchApiKey = searchConfig.algolia.searchApiKey.values[currentVersionId];
            assertNonNullish(
                searchApiKey,
                `Inconsistent State: Did not receive index segment for version "${currentVersionId}". This may indicate a backend bug.`,
            );
            return [algoliasearch(searchConfig.algolia.appId, searchApiKey), searchConfig.algolia.index];
        }
        return;
    }, [currentVersionId, searchConfig]);
}
