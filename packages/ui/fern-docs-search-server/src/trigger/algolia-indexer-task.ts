import { browseAllObjectsForDomain } from "@/algolia/browse-all-objects-for-domain.js";
import { createAlgoliaRecords } from "@/algolia/records/create-algolia-records.js";
import { ApiDefinition, FdrClient, FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { logger, task } from "@trigger.dev/sdk/v3";
import { algoliasearch } from "algoliasearch";
import { mapValues } from "es-toolkit";
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

        const client = new FdrClient({
            environment: "https://registry-dev2.buildwithfern.com",
            token: process.env.FERN_TOKEN,
        });

        const docs = await client.docs.v2.read.getDocsForUrl({ url: ApiDefinition.Url(payload.domain) });

        if (!docs.ok) {
            throw new Error(`Failed to get docs for ${payload.domain}: ${docs.error.error}`);
        }

        const org = await client.docs.v2.read.getOrganizationForUrl({ url: ApiDefinition.Url(payload.domain) });
        if (!org.ok) {
            throw new Error(`Failed to get org for ${payload.domain}: ${org.error.error}`);
        }

        const domain = new URL(withDefaultProtocol(payload.domain));

        const root = FernNavigation.utils.toRootNode(
            docs.body,
            payload.isBatchStreamToggleDisabled ?? false,
            payload.isApiScrollingDisabled ?? false,
        );

        // migrate pages
        const pages = mapValues(docs.body.definition.pages, (page) => page.markdown);

        // migrate apis
        const apis = mapValues(docs.body.definition.apis, (api) =>
            ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
                useJavaScriptAsTypeScript: payload.useJavaScriptAsTypeScript ?? false,
                alwaysEnableJavaScriptFetch: payload.alwaysEnableJavaScriptFetch ?? false,
                usesApplicationJsonInFormDataValue: payload.usesApplicationJsonInFormDataValue ?? false,
            }).migrate(),
        );

        const records = createAlgoliaRecords({
            root,
            domain: domain.host,
            org_id: org.body,
            pages,
            apis,
            authed: payload.authed ?? false,
        });

        if (process.env.ALGOLIA_APP_ID == null || process.env.ALGOLIA_ADMIN_API_KEY == null) {
            throw new Error("ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY must be set");
        }

        const algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

        const existingRecords = (await browseAllObjectsForDomain(algolia, domain.host, "fern-docs-search"))
            .map((object) => object.objectID)
            .filter((objectID): objectID is string => typeof objectID === "string");

        const response = await algolia.batch({
            indexName: "fern-docs-search",
            batchWriteParams: {
                requests: [
                    ...existingRecords.map((objectID) => ({
                        action: "deleteObject" as const,
                        body: { objectID },
                    })),
                    ...records.map((record) => ({
                        action: "addObject" as const,
                        body: record,
                    })),
                ],
            },
        });

        return response;
    },
});
