import { browseAllObjectsForDomain } from "@/algolia/browse-all-objects-for-domain.js";
import { createAlgoliaRecords } from "@/algolia/records/create-algolia-records.js";
import { SEARCHABLE_ATTRIBUTES, UNRETRIEVABLE_ATTRIBUTES } from "@/algolia/types.js";
import { loadDocsWithUrl } from "@/fdr/load-docs-with-url.js";
import { logger, task } from "@trigger.dev/sdk/v3";
import { algoliasearch } from "algoliasearch";
import { z } from "zod";

const algoliaIndexerPayloadSchema = z.object({
    domain: z.string(),

    // whether the docs are authed or not
    authed: z.boolean().optional(),

    // feature flags for v1 -> v2 migration
    isBatchStreamToggleDisabled: z.boolean().optional(),
    isApiScrollingDisabled: z.boolean().optional(),
    useJavaScriptAsTypeScript: z.boolean().optional(),
    alwaysEnableJavaScriptFetch: z.boolean().optional(),
    usesApplicationJsonInFormDataValue: z.boolean().optional(),
});

export const algoliaIndexerTask = task({
    id: "algolia-indexer",
    maxDuration: 300, // 5 minutes
    run: async (unparsedPayload: any, { ctx }) => {
        const payload = algoliaIndexerPayloadSchema.parse(unparsedPayload);
        logger.log("Indexing algolia", { payload, ctx });

        const { org_id, root, pages, apis, domain } = await loadDocsWithUrl(payload);

        const records = createAlgoliaRecords({ root, domain, org_id, pages, apis, authed: payload.authed ?? false });

        if (process.env.ALGOLIA_APP_ID == null || process.env.ALGOLIA_ADMIN_API_KEY == null) {
            throw new Error("ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY must be set");
        }

        const algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

        const existingRecords = (await browseAllObjectsForDomain(algolia, domain, "fern-docs-search"))
            .map((object) => object.objectID)
            .filter((objectID): objectID is string => typeof objectID === "string");

        await algolia.setSettings({
            indexName: "fern-docs-search",
            indexSettings: {
                searchableAttributes: [...SEARCHABLE_ATTRIBUTES],
                attributesForFaceting: UNRETRIEVABLE_ATTRIBUTES.map(
                    (attribute) => `afterDistinct(filterOnly(${attribute}))`,
                ),
                unretrievableAttributes: [...UNRETRIEVABLE_ATTRIBUTES],
                attributeForDistinct: "pathname",
                enableRules: true,
            },
        });

        const response = await algolia.batch({
            indexName: "fern-docs-search",
            batchWriteParams: {
                requests: [
                    ...existingRecords.map((objectID) => ({ action: "deleteObject" as const, body: { objectID } })),
                    ...records.map((record) => ({ action: "addObject" as const, body: record })),
                ],
            },
        });

        return response.taskID;
    },
});
