import {
  SearchClient,
  SearchForFacetValuesResponse,
  SearchResponse,
  algoliasearch,
} from "algoliasearch";

import { FdrAPI, FdrClient, FernNavigation } from "@fern-api/fdr-sdk";
import { assertNever } from "@fern-api/ui-core-utils";

import { Rule, RuleArgs, RuleResult } from "../runRules";

export class SearchSlugsCorrectRule implements Rule {
  name = "search-slugs-correct";
  description = "Check that search slugs are all";

  public async run({ fdr, url }: RuleArgs): Promise<RuleResult> {
    const getDocsForUrlResponse = await fdr.docs.v2.read.getDocsForUrl({
      url: FdrAPI.Url(url),
    });
    if (!getDocsForUrlResponse.ok) {
      return {
        name: this.name,
        success: false,
        message: `Failed to load docs for ${url} from FDR`,
      };
    }

    const node = FernNavigation.utils.toRootNode(getDocsForUrlResponse.body);
    const collector = FernNavigation.NodeCollector.collect(node);
    const slugs = new Set(collector.indexablePageSlugs);

    const searchInfo = getDocsForUrlResponse.body.definition.search;

    switch (searchInfo.type) {
      case "legacyMultiAlgoliaIndex":
        return {
          name: this.name,
          success: false,
          message: "Skipped querying legacy multi algolia index",
        };
      case "singleAlgoliaIndex":
        switch (searchInfo.value.type) {
          case "unversioned": {
            const algolia = algoliasearch(
              process.env.ALGOLIA_APP_ID ?? "",
              await getApiKeyForSegmentIndex({
                fdr,
                indexSegmentId: searchInfo.value.indexSegment.id,
              })
            );
            const value = await sampleRecordsFromIndexSegement({
              algolia,
              slugs,
            });
            return value.type === "valid"
              ? {
                  name: this.name,
                  success: true,
                }
              : {
                  name: this.name,
                  success: false,
                  message: `Search records have invalid slugs ${value.invalidSlugs.join(", ")}`,
                };
          }
          case "versioned": {
            const invalidSlugs: string[] = [];
            for (const [_, segmentId] of Object.entries(
              searchInfo.value.indexSegmentsByVersionId
            )) {
              const algolia = algoliasearch(
                process.env.ALGOLIA_APP_ID ?? "",
                await getApiKeyForSegmentIndex({
                  fdr,
                  indexSegmentId: segmentId.id,
                })
              );
              const value = await sampleRecordsFromIndexSegement({
                algolia,
                slugs,
              });
              if (value.type === "invalid") {
                invalidSlugs.push(...value.invalidSlugs);
              }
            }
            return invalidSlugs.length > 0
              ? {
                  name: this.name,
                  success: true,
                }
              : {
                  name: this.name,
                  success: false,
                  message: `Search records have invalid slugs ${invalidSlugs.join(", ")}`,
                };
          }
        }
    }
  }
}

export async function getApiKeyForSegmentIndex({
  fdr,
  indexSegmentId,
}: {
  fdr: FdrClient;
  indexSegmentId: string;
}): Promise<string> {
  const response = await fdr.docs.v2.read.getSearchApiKeyForIndexSegment({
    indexSegmentId,
  });
  if (!response.ok) {
    throw new Error("Failed to load index segment api key");
  }
  return response.body.searchApiKey;
}

interface ValidRecordResult {
  type: "valid";
}

interface InvalidRecordResult {
  type: "invalid";
  invalidSlugs: string[];
}

type SampleRecordResult = ValidRecordResult | InvalidRecordResult;

export async function sampleRecordsFromIndexSegement({
  algolia,
  slugs,
}: {
  algolia: SearchClient;
  slugs: Set<string>;
}): Promise<SampleRecordResult> {
  const result = await algolia.search([
    {
      type: "default",
      indexName: "search_index_prod",
    },
  ]);

  const invalidSlugs: string[] = [];
  for (const res of result.results) {
    if (isSearchHit(res) && res.hits != null) {
      for (const hit of res.hits) {
        const algoliaRecord = hit as any as FdrAPI.AlgoliaRecord;
        const slug = getSlugFromAlgoliaRecord(algoliaRecord);
        if (!slugs.has(slug)) {
          invalidSlugs.push(slug);
        }
      }
    }
  }
  return invalidSlugs.length > 0
    ? { type: "invalid", invalidSlugs }
    : { type: "valid" };
}

function getSlugFromAlgoliaRecord(algoliaRecord: FdrAPI.AlgoliaRecord): string {
  switch (algoliaRecord.type) {
    case "endpoint":
    case "page":
      return algoliaRecord.path;
    case "endpoint-v2":
    case "page-v2": {
      let slug = "";
      for (const part of algoliaRecord.path.parts) {
        if (!part.skipUrlSlug) {
          slug += `/${part.urlSlug}`;
        }
      }
      return slug.substring(1);
    }
    case "endpoint-v3":
    case "page-v3":
    case "webhook-v3":
    case "websocket-v3":
    case "endpoint-v4":
    case "page-v4":
    case "webhook-v4":
    case "websocket-v4":
    case "markdown-section-v1":
    case "endpoint-field-v1":
    case "websocket-field-v1":
    case "webhook-field-v1":
      return algoliaRecord.slug;
    default:
      assertNever(algoliaRecord);
  }
}

function isSearchHit<T>(
  value: SearchResponse<T> | SearchForFacetValuesResponse
): value is SearchResponse<T> {
  return (value as SearchResponse)?.page != null;
}
