import { FernRegistry, FernRegistryClient } from "@fern-fern/registry-browser";
import algolia, { type SearchClient } from "algoliasearch/lite";

import { useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { getEnvConfig } from "../env";

export type SearchService =
    | {
          isAvailable: true;
          loadClient: () => Promise<SearchClient | undefined>;
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

    return useMemo<SearchService>(() => {
        const envConfig = getEnvConfig();
        if (typeof searchInfo !== "object") {
            return docsDefinition.algoliaSearchIndex != null
                ? {
                      isAvailable: true,
                      loadClient: async () => algolia(envConfig.algoliaAppId, envConfig.algoliaApiKey),
                      index: docsDefinition.algoliaSearchIndex,
                  }
                : { isAvailable: false };
        } else if (searchInfo.type === "legacyMultiAlgoliaIndex") {
            const algoliaIndex = searchInfo.algoliaIndex ?? docsDefinition.algoliaSearchIndex;
            return algoliaIndex != null
                ? {
                      isAvailable: true,
                      loadClient: async () => algolia(envConfig.algoliaAppId, envConfig.algoliaApiKey),
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
                loadClient: async () => {
                    const resp = await registryClient.docs.v2.read.getSearchApiKeyForIndexSegment({
                        indexSegmentId: indexSegment.id,
                    });
                    if (!resp.ok) {
                        return undefined;
                    }
                    return algolia(envConfig.algoliaAppId, resp.body.searchApiKey);
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
                loadClient: async () => {
                    const resp = await registryClient.docs.v2.read.getSearchApiKeyForIndexSegment({
                        indexSegmentId: indexSegment.id,
                    });
                    if (!resp.ok) {
                        return undefined;
                    }
                    return algolia(envConfig.algoliaAppId, resp.body.searchApiKey);
                },
                index: envConfig.algoliaSearchIndex,
            };
        }
    }, [docsDefinition.algoliaSearchIndex, docsInfo, searchInfo]);
}
