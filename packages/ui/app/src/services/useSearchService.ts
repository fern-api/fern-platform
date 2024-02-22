import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useMemo } from "react";
import { getEnvConfig, type EnvironmentConfig } from "../env";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { REGISTRY_SERVICE } from "./registry";

export type SearchCredentials = {
    appId: string;
    searchApiKey: string;
};

export declare namespace SearchService {
    export interface Available {
        isAvailable: true;
        loadCredentials: () => Promise<SearchCredentials | undefined>;
        index: string;
    }

    export interface Unavailable {
        isAvailable: false;
    }
}

export type SearchService = SearchService.Available | SearchService.Unavailable;

function createSearchApiKeyLoader(envConfig: EnvironmentConfig, indexSegmentId: string) {
    return async () => {
        const resp = await REGISTRY_SERVICE.docs.v2.read.getSearchApiKeyForIndexSegment({
            indexSegmentId,
        });
        if (!resp.ok) {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch index segment api key", resp.error);
            return {
                appId: envConfig.algoliaAppId,
                searchApiKey: envConfig.algoliaApiKey,
            };
        }
        const { searchApiKey } = resp.body;
        return {
            appId: envConfig.algoliaAppId,
            searchApiKey,
        };
    };
}

export function useSearchService(
    searchInfo: DocsV1Read.SearchInfo,
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null,
): SearchService {
    const { activeVersionContext } = useDocsSelectors();

    return useMemo<SearchService>(() => {
        try {
            const envConfig = getEnvConfig();
            if (typeof searchInfo !== "object") {
                return algoliaSearchIndex != null
                    ? {
                          isAvailable: true,
                          loadCredentials: async () => ({
                              appId: envConfig.algoliaAppId,
                              searchApiKey: envConfig.algoliaApiKey,
                          }),
                          index: algoliaSearchIndex,
                      }
                    : { isAvailable: false };
            } else if (searchInfo.type === "legacyMultiAlgoliaIndex") {
                const algoliaIndex = searchInfo.algoliaIndex ?? algoliaSearchIndex;
                return algoliaIndex != null
                    ? {
                          isAvailable: true,
                          loadCredentials: async () => ({
                              appId: envConfig.algoliaAppId,
                              searchApiKey: envConfig.algoliaApiKey,
                          }),
                          index: algoliaIndex,
                      }
                    : { isAvailable: false };
            } else if (searchInfo.value.type === "unversioned") {
                if (envConfig.algoliaSearchIndex == null) {
                    throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX"');
                }
                const { indexSegment } = searchInfo.value;

                return {
                    isAvailable: true,
                    loadCredentials: createSearchApiKeyLoader(envConfig, indexSegment.id),
                    index: envConfig.algoliaSearchIndex,
                };
            } else {
                if (activeVersionContext.type !== "versioned") {
                    throw new Error("Inconsistent State: Received search info is versioned but docs are unversioned");
                }
                const versionId = activeVersionContext.version.info.id;
                const { indexSegmentsByVersionId } = searchInfo.value;
                const indexSegment = indexSegmentsByVersionId[versionId];
                if (indexSegment == null) {
                    throw new Error(
                        `Inconsistent State: Did not receive index segment for version "${versionId}". This may indicate a backend bug.`,
                    );
                }
                if (envConfig.algoliaSearchIndex == null) {
                    throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX"');
                }
                return {
                    isAvailable: true,
                    loadCredentials: createSearchApiKeyLoader(envConfig, indexSegment.id),
                    index: envConfig.algoliaSearchIndex,
                };
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to initialize search service", e);
            return { isAvailable: false };
        }
    }, [activeVersionContext, algoliaSearchIndex, searchInfo]);
}
