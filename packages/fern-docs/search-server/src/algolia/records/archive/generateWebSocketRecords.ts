import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { toBreadcrumbs, toDescription } from "./utils";

interface GenerateWebSocketRecordOptions {
    indexSegmentId: Algolia.IndexSegmentId;
    node: FernNavigation.WebSocketNode;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    channel: ApiDefinition.WebSocketChannel;
    version: Algolia.AlgoliaRecordVersionV3 | undefined;
}

export function generateWebSocketRecord({
    indexSegmentId,
    node,
    breadcrumb,
    channel,
    version,
}: GenerateWebSocketRecordOptions): Algolia.AlgoliaRecord.WebsocketV4 {
    const description = toDescription([channel.description]);
    const channelRecord: Algolia.AlgoliaRecord.WebsocketV4 = {
        type: "websocket-v4",
        title: node.title,
        description: description?.length
            ? truncateToBytes(description, 50 * 1000)
            : undefined,
        breadcrumbs: breadcrumb.map((breadcrumb) => ({
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        })),
        endpointPath: channel.path,
        slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
        version,
        indexSegmentId,
    };
    return channelRecord;
}

interface GenerateWebSocketFieldRecordsOptions {
    channelRecord: Algolia.AlgoliaRecord.WebsocketV4;
    channel: ApiDefinition.WebSocketChannel;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function generateWebSocketFieldRecords({
    channelRecord,
    channel,
    types,
}: GenerateWebSocketFieldRecordsOptions): Algolia.AlgoliaRecord.WebsocketFieldV1[] {
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
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
                property,
                types,
                [
                    { type: "meta", value: "request", displayName: "Request" },
                    { type: "meta", value: "header", displayName: "Headers" },
                ]
            )
        );
    });

    channel.queryParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
                property,
                types,
                [
                    { type: "meta", value: "request", displayName: "Request" },
                    {
                        type: "meta",
                        value: "query",
                        displayName: "Query Parameters",
                    },
                ]
            )
        );
    });

    channel.pathParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
                property,
                types,
                [
                    { type: "meta", value: "request", displayName: "Request" },
                    {
                        type: "meta",
                        value: "path",
                        displayName: "Path Parameters",
                    },
                ]
            )
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
            slug: FernNavigation.V1.Slug(
                `${channelRecord.slug}#${message.origin}.${message.type}`
            ),
            availability: message.availability,
            extends: undefined,
        });

        push(
            ApiDefinition.collectTypeDefinitionTree(message.body, types, {
                path: [
                    {
                        type: "meta",
                        value: message.origin,
                        displayName: undefined,
                    },
                    {
                        type: "meta",
                        value: message.type,
                        displayName: message.displayName,
                    },
                ],
            })
        );
    });

    return fieldRecords;
}
