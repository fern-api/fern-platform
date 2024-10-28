import { browseAllObjectsForDomain } from "@/algolia/browse-all-objects-for-domain.js";
import { createAlgoliaRecords } from "@/algolia/records/create-algolia-records.js";
import { ApiDefinition, FdrClient, FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FeatureFlags, addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { logger, task } from "@trigger.dev/sdk/v3";
import { algoliasearch } from "algoliasearch";
import { mapValues } from "es-toolkit";
import { z } from "zod";

const algoliaIndexerPayloadSchema = z.object({
    domain: z.string(),
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

        const flags = (await fetch(
            new URL(addLeadingSlash(slugjoin(docs.body.baseUrl.basePath, "api/fern-docs/feature-flags")), domain),
        ).then((res) => res.json())) as FeatureFlags;

        const root = FernNavigation.utils.toRootNode(
            docs.body,
            flags.isBatchStreamToggleDisabled,
            flags.isApiScrollingDisabled,
        );

        // migrate pages
        const pages = mapValues(docs.body.definition.pages, (page) => page.markdown);

        // migrate apis
        const apis = mapValues(docs.body.definition.apis, (api) =>
            ApiDefinition.ApiDefinitionV1ToLatest.from(api, flags).migrate(),
        );

        const records = createAlgoliaRecords({
            root,
            domain: domain.host,
            org_id: org.body,
            pages,
            apis,
            authed: false,
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
