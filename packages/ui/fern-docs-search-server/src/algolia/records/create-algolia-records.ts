import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { AlgoliaRecord } from "../types";
import { createApiReferenceRecordHttp } from "./create-api-reference-record-http";
import { createApiReferenceRecordWebSocket } from "./create-api-reference-record-web-socket";
import { createApiReferenceRecordWebhook } from "./create-api-reference-record-webhook";
import { createBaseRecord } from "./create-base-record";
import { createChangelogRecord } from "./create-changelog-record";
import { createEndpointBaseRecordHttp } from "./create-endpoint-record-http";
import { createEndpointBaseRecordWebSocket } from "./create-endpoint-record-web-socket";
import { createEndpointBaseRecordWebhook } from "./create-endpoint-record-webhook";
import { createMarkdownRecords } from "./create-markdown-records";
import { createNavigationRecord } from "./create-navigation-record";

interface CreateAlgoliaRecordsOptions {
    root: FernNavigation.RootNode;
    domain: string;
    org_id: string;
    pages: Record<FernNavigation.PageId, string>;
    apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>;
    authed: boolean;
}

export function createAlgoliaRecords({
    root,
    domain,
    org_id,
    pages,
    apis,
    authed,
}: CreateAlgoliaRecordsOptions): AlgoliaRecord[] {
    const collector = FernNavigation.NodeCollector.collect(root);

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

    const records: AlgoliaRecord[] = [];

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

        const base = createBaseRecord({ node, parents: collector.getParents(node.id) ?? [], domain, org_id, authed });

        if (node.type === "changelogEntry") {
            records.push(createChangelogRecord({ base, markdown, date: node.date }));
        } else {
            records.push(...createMarkdownRecords({ base, markdown }));
        }
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

        const base = createBaseRecord({ node, parents: collector.getParents(node.id) ?? [], domain, org_id, authed });

        if (node.type === "endpoint") {
            const endpoint = apiDefinition.endpoints[node.endpointId];
            if (!endpoint) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has endpoint id ${node.endpointId} but no endpoint`);
                return;
            }

            const endpointBase = createEndpointBaseRecordHttp({ base, node, endpoint, types: apiDefinition.types });
            records.push(createApiReferenceRecordHttp({ endpointBase, endpoint }));
            return;
        }

        if (node.type === "webSocket") {
            const endpoint = apiDefinition.websockets[node.webSocketId];
            if (!endpoint) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has web socket id ${node.webSocketId} but no web socket`);
                return;
            }

            const endpointBase = createEndpointBaseRecordWebSocket({
                base,
                node,
                endpoint,
                types: apiDefinition.types,
            });
            records.push(createApiReferenceRecordWebSocket({ endpointBase }));
            return;
        }

        if (node.type === "webhook") {
            const endpoint = apiDefinition.webhooks[node.webhookId];
            if (!endpoint) {
                // eslint-disable-next-line no-console
                console.error(`API leaf node ${node.slug} has web hook id ${node.webhookId} but no web hook`);
                return;
            }

            const endpointBase = createEndpointBaseRecordWebhook({ base, node, endpoint, types: apiDefinition.types });
            records.push(createApiReferenceRecordWebhook({ endpointBase, endpoint }));
            return;
        }
    });

    const distinctSlugs = new Set<string>();
    collector.getNodesInOrder().forEach((node) => {
        if (!FernNavigation.hasMetadata(node)) {
            return;
        }

        if (distinctSlugs.has(node.slug)) {
            return;
        }

        distinctSlugs.add(node.slug);

        const base = createBaseRecord({ node, parents: collector.getParents(node.id) ?? [], domain, org_id, authed });
        records.push(createNavigationRecord({ base, node_type: node.type }));
    });

    // remove all undefined values
    // TODO: trim or filter out any record that is > 100kb
    return JSON.parse(JSON.stringify(records));
}
