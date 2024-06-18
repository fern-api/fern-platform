import { SearchForFacetValuesResponse, SearchResponse } from "@algolia/client-search";
import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { assertNever } from "@fern-ui/core-utils";
import algoliasearch, { SearchClient } from "algoliasearch";
import { Rule, RuleArgs, RuleResult } from "../runRules";

export class SearchSlugsCorrectRule implements Rule {
    name = "search-slugs-correct";
    description = "Check that search slugs are all";

    public async run({ fdr, url }: RuleArgs): Promise<RuleResult> {
        const getDocsForUrlResponse = await fdr.docs.v2.read.getDocsForUrl({
            url,
        });
        if (!getDocsForUrlResponse.ok) {
            return {
                name: this.name,
                success: false,
                message: `Failed to load docs for ${url} from FDR`,
            };
        }

        const node = FernNavigation.utils.convertLoadDocsForUrlResponse(getDocsForUrlResponse.body);
        const slugCollector = FernNavigation.NodeCollector.collect(node);
        const slugs = new Set(slugCollector.getPageSlugs());

        const searchInfo = getDocsForUrlResponse.body.definition.search;

        switch (searchInfo.type) {
            case "legacyMultiAlgoliaIndex":
                return { name: this.name, success: false, message: "Skipped querying legacy multi algolia index" };
            case "singleAlgoliaIndex":
                switch (searchInfo.value.type) {
                    case "unversioned": {
                        const algolia = algoliasearch(
                            process.env.ALGOLIA_APP_ID ?? "",
                            searchInfo.value.indexSegment.searchApiKey,
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
                        for (const [_, segmentId] of Object.entries(searchInfo.value.indexSegmentsByVersionId)) {
                            const algolia = algoliasearch(process.env.ALGOLIA_APP_ID ?? "", segmentId.searchApiKey);
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const algoliaRecord = hit as any as FdrAPI.AlgoliaRecord;
                const slug = getSlugFromAlgoliaRecord(algoliaRecord);
                if (!slugs.has(slug)) {
                    invalidSlugs.push(slug);
                }
            }
        }
    }
    return invalidSlugs.length > 0 ? { type: "invalid", invalidSlugs } : { type: "valid" };
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
            return algoliaRecord.slug;
        default:
            assertNever(algoliaRecord);
    }
}

function isSearchHit<T>(value: SearchResponse<T> | SearchForFacetValuesResponse): value is SearchResponse<T> {
    return (value as SearchResponse)?.page != null;
}
