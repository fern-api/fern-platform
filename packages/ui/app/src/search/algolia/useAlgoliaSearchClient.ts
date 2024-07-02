import { assertNonNullish } from "@fern-ui/core-utils";
import algolia, { SearchClient } from "algoliasearch";
import { useMemo } from "react";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { useSearchConfig } from "../../services/useSearchService";

export function useAlgoliaSearchClient(): [SearchClient, index: string] | undefined {
    const { currentVersionId } = useDocsContext();
    const [searchConfig] = useSearchConfig();

    return useMemo(() => {
        if (!searchConfig.isAvailable) {
            return;
        }

        if (searchConfig.algolia.searchApiKey.type === "unversioned") {
            return [
                algolia(searchConfig.algolia.appId, searchConfig.algolia.searchApiKey.value),
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
            return [algolia(searchConfig.algolia.appId, searchApiKey), searchConfig.algolia.index];
        }
        return;
    }, [currentVersionId, searchConfig]);
}
