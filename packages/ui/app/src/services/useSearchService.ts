import { FernRegistry } from "@fern-fern/registry-browser";
import algolia, { type SearchClient } from "algoliasearch/lite";
import { useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { getEnvConfig } from "../env";

export type SearchService =
    | {
          isAvailable: true;
          client: SearchClient;
          index: string;
      }
    | {
          isAvailable: false;
      };

export function useSearchService(): SearchService {
    const { docsDefinition, docsInfo } = useDocsContext();
    const { search: searchInfo } = docsDefinition;

    return useMemo<SearchService>(() => {
        const envConfig = getEnvConfig();
        if (typeof searchInfo !== "object") {
            return docsDefinition.algoliaSearchIndex != null
                ? {
                      isAvailable: true,
                      client: algolia(envConfig.algoliaAppId, envConfig.algoliaApiKey),
                      index: docsDefinition.algoliaSearchIndex,
                  }
                : { isAvailable: false };
        } else if (searchInfo.type === "legacyMultiAlgoliaIndex") {
            const algoliaIndex = searchInfo.algoliaIndex ?? docsDefinition.algoliaSearchIndex;
            return algoliaIndex != null
                ? {
                      isAvailable: true,
                      client: algolia(envConfig.algoliaAppId, envConfig.algoliaApiKey),
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
                client: algolia(envConfig.algoliaAppId, indexSegment.searchApiKey),
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
                client: algolia(envConfig.algoliaAppId, indexSegment.searchApiKey),
                index: envConfig.algoliaSearchIndex,
            };
        }
    }, [docsDefinition.algoliaSearchIndex, docsInfo, searchInfo]);
}
