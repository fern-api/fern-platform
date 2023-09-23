import { FernRegistry, FernRegistryClient } from "@fern-fern/registry-browser";

import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { getEnvConfig } from "../env";

export type SearchCredentials = {
    appId: string;
    searchApiKey: string;
};

export type SearchService =
    | {
          isAvailable: true;
          loadCredentials: () => Promise<SearchCredentials | undefined>;
          index: string;
      }
    | {
          isAvailable: false;
      };

const registryClient = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

export function useSearchService(): SearchService {
    const { docsDefinition, docsInfo } = useDocsContext();
    const { search: searchInfo } = docsDefinition;

    const loadSearchApiKey = useCallback(async (indexSegmentId: string) => {
        const resp = await registryClient.docs.v2.read.getSearchApiKeyForIndexSegment({
            indexSegmentId,
        });
        if (!resp.ok) {
            return undefined;
        }
        return resp.body.searchApiKey;
    }, []);

    return useMemo<SearchService>(() => {
        const envConfig = getEnvConfig();
        if (typeof searchInfo !== "object") {
            return docsDefinition.algoliaSearchIndex != null
                ? {
                      isAvailable: true,
                      loadCredentials: async () => ({
                          appId: envConfig.algoliaAppId,
                          searchApiKey: envConfig.algoliaApiKey,
                      }),
                      index: docsDefinition.algoliaSearchIndex,
                  }
                : { isAvailable: false };
        } else if (searchInfo.type === "legacyMultiAlgoliaIndex") {
            const algoliaIndex = searchInfo.algoliaIndex ?? docsDefinition.algoliaSearchIndex;
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
            if (docsInfo.type !== "unversioned") {
                throw new Error("Inconsistent State: Received search info is unversioned but docs are versioned");
            }
            if (envConfig.algoliaSearchIndex == null) {
                throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX"');
            }
            const { indexSegment } = searchInfo.value;

            return {
                isAvailable: true,
                loadCredentials: async () => {
                    const searchApiKey = await loadSearchApiKey(indexSegment.id);
                    return searchApiKey != null
                        ? {
                              appId: envConfig.algoliaAppId,
                              searchApiKey,
                          }
                        : undefined;
                },
                index: envConfig.algoliaSearchIndex,
            };
        } else {
            if (docsInfo.type !== "versioned") {
                throw new Error("Inconsistent State: Received search info is versioned but docs are unversioned");
            }
            const versionId = FernRegistry.docs.v1.read.VersionId(docsInfo.activeVersionName);
            const { indexSegmentsByVersionId } = searchInfo.value;
            const indexSegment = indexSegmentsByVersionId[versionId];
            if (indexSegment == null) {
                throw new Error(
                    `Inconsistent State: Did not receive index segment for version "${versionId}". This may indicate a backend bug.`
                );
            }
            if (envConfig.algoliaSearchIndex == null) {
                throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX"');
            }
            return {
                isAvailable: true,
                loadCredentials: async () => {
                    const searchApiKey = await loadSearchApiKey(indexSegment.id);
                    return searchApiKey != null
                        ? {
                              appId: envConfig.algoliaAppId,
                              searchApiKey,
                          }
                        : undefined;
                },
                index: envConfig.algoliaSearchIndex,
            };
        }
    }, [docsDefinition.algoliaSearchIndex, loadSearchApiKey, docsInfo, searchInfo]);
}
