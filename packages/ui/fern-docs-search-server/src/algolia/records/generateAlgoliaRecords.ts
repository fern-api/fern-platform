import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { generateEndpointRecords } from "./generateEndpointRecords";
import { generateMarkdownRecords } from "./generateMarkdownRecords";
import { generateWebSocketRecords } from "./generateWebSocketRecords";
import { generateWebhookRecords } from "./generateWebhookRecords";
import { GenerateAlgoliaRecordsFlags } from "./types";

export function generateAlgoliaRecords(
    indexSegmentId: Algolia.IndexSegmentId,
    nodes: FernNavigation.RootNode,
    pages: Record<FernNavigation.PageId, string>,
    apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>,
    flags: GenerateAlgoliaRecordsFlags,
): Algolia.AlgoliaRecord[] {
    const collector = FernNavigation.NodeCollector.collect(nodes);

    const records: Algolia.AlgoliaRecord[] = [];

    // collector.getVersionNodes().forEach((node) => {

    collector.indexablePageSlugs
        .map((slug) => collector.slugMap.get(slug))
        .filter(isNonNullish)
        .forEach((node) => {
            if (!FernNavigation.hasMarkdown(node) && !FernNavigation.isApiLeaf(node)) {
                return;
            }

            const parents = collector.getParents(node.id) ?? [];
            const breadcrumb = FernNavigation.utils.createBreadcrumb(parents);
            const versionNode = parents.find((n): n is FernNavigation.VersionNode => n.type === "version");
            const version: Algolia.AlgoliaRecordVersionV3 | undefined = versionNode
                ? {
                      id: versionNode.versionId,
                      slug: FernNavigation.V1.Slug(versionNode.pointsTo ?? versionNode.slug),
                  }
                : undefined;

            if (FernNavigation.hasMarkdown(node)) {
                const pageId = FernNavigation.getPageId(node);

                if (pageId) {
                    const markdown = pages[pageId];
                    if (markdown) {
                        records.push(...generateMarkdownRecords(indexSegmentId, breadcrumb, node, version, markdown));
                    } else {
                        // eslint-disable-next-line no-console
                        console.error(`Page node ${node.slug} has page id ${pageId} but no markdown`);
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.error(`Page node ${node.slug} has no page id`);
                }
            }

            if (FernNavigation.isApiLeaf(node)) {
                const apiDefinition = apis[node.apiDefinitionId];
                if (apiDefinition) {
                    if (node.type === "endpoint") {
                        records.push(
                            ...generateEndpointRecords(indexSegmentId, node, breadcrumb, apiDefinition, version, flags),
                        );
                    } else if (node.type === "webSocket") {
                        records.push(
                            ...generateWebSocketRecords(
                                indexSegmentId,
                                node,
                                breadcrumb,
                                apiDefinition,
                                version,
                                flags,
                            ),
                        );
                    } else if (node.type === "webhook") {
                        records.push(
                            ...generateWebhookRecords(indexSegmentId, node, breadcrumb, apiDefinition, version, flags),
                        );
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.error(
                        `API leaf node ${node.slug} has api definition id ${node.apiDefinitionId} but no api definition`,
                    );
                }
            }
        });

    return records;
}
