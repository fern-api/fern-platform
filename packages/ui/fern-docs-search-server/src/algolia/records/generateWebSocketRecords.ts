import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { GenerateAlgoliaRecordsFlags } from "./types";
import { toBreadcrumbs, toDescription } from "./utils";

export function generateWebSocketRecords(
    indexSegmentId: Algolia.IndexSegmentId,
    node: FernNavigation.WebSocketNode,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    apiDefinition: ApiDefinition.ApiDefinition,
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    { isFieldRecordsEnabled }: GenerateAlgoliaRecordsFlags,
): (Algolia.AlgoliaRecord.WebsocketV4 | Algolia.AlgoliaRecord.WebsocketFieldV1)[] {
    const channel = apiDefinition.websockets[node.webSocketId];

    if (channel == null) {
        // eslint-disable-next-line no-console
        console.error(`WebSocket node ${node.slug} has no web socket ${node.webSocketId}`);
        return [];
    }

    const channelRecord: Algolia.AlgoliaRecord.WebsocketV4 = {
        type: "websocket-v4",
        title: node.title,
        description: toDescription([channel.description]),
        breadcrumbs: breadcrumb.map((breadcrumb) => ({
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        })),
        endpointPath: channel.path,
        slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
        version,
        indexSegmentId,
    };

    if (!isFieldRecordsEnabled) {
        return [channelRecord];
    }

    const fieldRecords: Algolia.AlgoliaRecord.WebsocketFieldV1[] = [];

    function push(items: ApiDefinition.TypeDefinitionTreeItem[]) {
        items.forEach((item) => {
            const breadcrumbs = toBreadcrumbs(channelRecord, item.path);
            const last = breadcrumbs[breadcrumbs.length - 1];
            if (!last) {
                throw new Error("Breadcrumb should have at least 1");
            }

            fieldRecords.push({
                ...channelRecord,
                type: "websocket-field-v1",
                title: last.title,
                description: toDescription(item.descriptions),
                breadcrumbs: breadcrumbs.slice(0, breadcrumbs.length - 1),
                slug: FernNavigation.V1.Slug(last.slug),
                availability: item.availability,
                extends: undefined,
            });
        });
    }

    channel.requestHeaders?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "header", displayName: "Headers" },
            ]),
        );
    });

    channel.queryParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "query", displayName: "Query Parameters" },
            ]),
        );
    });

    channel.pathParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "path", displayName: "Path Parameters" },
            ]),
        );
    });

    channel.messages.forEach((message) => {
        fieldRecords.push({
            ...channelRecord,
            type: "websocket-field-v1",
            title: message.displayName ?? message.type,
            description: toDescription([message.description]),
            breadcrumbs: toBreadcrumbs(channelRecord, [
                { type: "meta", value: message.origin, displayName: undefined },
            ]),
            slug: FernNavigation.V1.Slug(`${channelRecord.slug}#${message.origin}.${message.type}`),
            availability: message.availability,
            extends: undefined,
        });

        push(
            ApiDefinition.collectTypeDefinitionTree(message.body, apiDefinition.types, {
                path: [
                    { type: "meta", value: message.origin, displayName: undefined },
                    { type: "meta", value: message.type, displayName: message.displayName },
                ],
            }),
        );
    });

    return [channelRecord, ...fieldRecords];
}
