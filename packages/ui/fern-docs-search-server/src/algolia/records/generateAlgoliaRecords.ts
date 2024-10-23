import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { generateEndpointFieldRecords, generateEndpointRecord } from "./generateEndpointRecords.js";
import { generateMarkdownRecords } from "./generateMarkdownRecords.js";
import { generateWebSocketFieldRecords, generateWebSocketRecord } from "./generateWebSocketRecords.js";
import { generateWebhookFieldRecords, generateWebhookRecord } from "./generateWebhookRecords.js";

interface GenerateAlgoliaRecordsOptions {
    indexSegmentId: Algolia.IndexSegmentId;
    nodes: FernNavigation.RootNode;
    pages: Record<FernNavigation.PageId, string>;
    apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>;
    isFieldRecordsEnabled: boolean;
}

export function generateAlgoliaRecords({
    indexSegmentId,
    nodes,
    pages,
    apis,
    isFieldRecordsEnabled,
}: GenerateAlgoliaRecordsOptions): Algolia.AlgoliaRecord[] {
    const collector = FernNavigation.NodeCollector.collect(nodes);

    const indexablePageNodes = collector.indexablePageSlugs
        .map((slug) => collector.slugMap.get(slug))
        .filter(isNonNullish);

    if (collector.indexablePageSlugs.length !== indexablePageNodes.length) {
        // eslint-disable-next-line no-console
        console.warn(
            `Some indexable page nodes were not found: ${collector.indexablePageSlugs.filter(
                (slug) => !collector.slugMap.has(slug),
            )}`,
        );
    }

    const markdownNodes = indexablePageNodes.filter(FernNavigation.hasMarkdown);
    const apiLeafNodes = indexablePageNodes.filter(FernNavigation.isApiLeaf);

    const records: Algolia.AlgoliaRecord[] = [];

    /**
     * Markdown nodes contain pages, sections with overview content, and changelog nodes
     * TODO: we probably want to show changelog nodes as a separate entity.
     */
    markdownNodes.forEach((node) => {
        const pageId = FernNavigation.getPageId(node);
        if (!pageId) {
            // eslint-disable-next-line no-console
            console.error(`Page node ${node.slug} has no page id`);
            return;
        }
        const markdown = pages[pageId];
        if (!markdown) {
            // eslint-disable-next-line no-console
            console.error(`Page node ${node.slug} has page id ${pageId} but no markdown`);
            return;
        }

        const parents = collector.getParents(node.id) ?? [];
        const breadcrumb = FernNavigation.utils.createBreadcrumb(parents);
        const versionNode = parents.find((n): n is FernNavigation.VersionNode => n.type === "version");
        const version: Algolia.AlgoliaRecordVersionV3 | undefined = versionNode
            ? { id: versionNode.versionId, slug: FernNavigation.V1.Slug(versionNode.pointsTo ?? versionNode.slug) }
            : undefined;

        records.push(
            ...generateMarkdownRecords({
                indexSegmentId,
                breadcrumb,
                node,
                version,
                markdown,
            }),
        );
    });

    apiLeafNodes.forEach((node) => {
        const apiDefinition = apis[node.apiDefinitionId];

        if (!apiDefinition) {
            // eslint-disable-next-line no-console
            console.error(
                `API leaf node ${node.slug} has api definition id ${node.apiDefinitionId} but no api definition`,
            );
            return;
        }

        const parents = collector.getParents(node.id) ?? [];
        const breadcrumb = FernNavigation.utils.createBreadcrumb(parents);
        const versionNode = parents.find((n): n is FernNavigation.VersionNode => n.type === "version");
        const version: Algolia.AlgoliaRecordVersionV3 | undefined = versionNode
            ? { id: versionNode.versionId, slug: FernNavigation.V1.Slug(versionNode.pointsTo ?? versionNode.slug) }
            : undefined;

        if (node.type === "endpoint") {
            const endpoint = apiDefinition.endpoints[node.endpointId];
            if (!endpoint) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has endpoint id ${node.endpointId} but no endpoint`);
                return;
            }

            const endpointRecord = generateEndpointRecord({
                indexSegmentId,
                node,
                breadcrumb,
                endpoint,
                version,
            });

            records.push(endpointRecord);

            if (isFieldRecordsEnabled) {
                records.push(
                    ...generateEndpointFieldRecords({
                        endpointRecord,
                        endpoint,
                        types: apiDefinition.types,
                    }),
                );
            }
        } else if (node.type === "webSocket") {
            const channel = apiDefinition.websockets[node.webSocketId];
            if (!channel) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has web socket id ${node.webSocketId} but no web socket`);
                return;
            }

            const channelRecord = generateWebSocketRecord({
                indexSegmentId,
                node,
                breadcrumb,
                channel,
                version,
            });

            records.push(channelRecord);

            if (isFieldRecordsEnabled) {
                records.push(
                    ...generateWebSocketFieldRecords({
                        channelRecord,
                        channel,
                        types: apiDefinition.types,
                    }),
                );
            }
        } else if (node.type === "webhook") {
            const webhook = apiDefinition.webhooks[node.webhookId];
            if (!webhook) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has web hook id ${node.webhookId} but no web hook`);
                return;
            }

            const webhookRecord = generateWebhookRecord({
                indexSegmentId,
                node,
                breadcrumb,
                webhook,
                version,
            });

            records.push(webhookRecord);

            if (isFieldRecordsEnabled) {
                records.push(
                    ...generateWebhookFieldRecords({
                        webhookRecord,
                        webhook,
                        types: apiDefinition.types,
                    }),
                );
            }
        }
    });

    return records;
}
