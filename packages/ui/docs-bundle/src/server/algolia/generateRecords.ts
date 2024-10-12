import { Algolia } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish, titleCase } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-ui/ui";
import GithubSlugger from "github-slugger";
import { camelCase, upperFirst } from "lodash-es";
import { toString } from "mdast-util-to-string";
import { UnreachableCaseError } from "ts-essentials";
import { visit } from "unist-util-visit";
import { parseMarkdownToTree } from "../markdown/parse";
import { getPosition } from "../markdown/position";

export function generateAlgoliaRecords(
    indexSegmentId: Algolia.IndexSegmentId,
    nodes: FernNavigation.RootNode,
    pages: Record<FernNavigation.PageId, string>,
    apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>,
    isFieldRecordsEnabled: boolean,
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
                        records.push(...parseMarkdownPage(indexSegmentId, node, breadcrumb, version, markdown));
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
                            ...generateEndpointRecords(
                                node,
                                apiDefinition,
                                breadcrumb,
                                version,
                                indexSegmentId,
                                isFieldRecordsEnabled,
                            ),
                        );
                    } else if (node.type === "webSocket") {
                        records.push(
                            ...generateWebSocketRecords(
                                node,
                                apiDefinition,
                                breadcrumb,
                                version,
                                indexSegmentId,
                                isFieldRecordsEnabled,
                            ),
                        );
                    } else if (node.type === "webhook") {
                        records.push(
                            ...generateWebhookRecords(
                                node,
                                apiDefinition,
                                breadcrumb,
                                version,
                                indexSegmentId,
                                isFieldRecordsEnabled,
                            ),
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

const slugger = new GithubSlugger();

function parseMarkdownPage(
    indexSegmentId: Algolia.IndexSegmentId,
    node: FernNavigation.NavigationNodeWithMarkdown,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    markdown: string,
): Algolia.AlgoliaRecord.PageV4[] {
    const { data, content } = getFrontmatter(markdown);
    const lines = content.split("\n");
    const tree = parseMarkdownToTree(content);
    const records: Algolia.AlgoliaRecord.PageV4[] = [];

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const title = data.title ?? node.title;

    // collect all headings in the document
    const headings: {
        depth: 1 | 2 | 3 | 4 | 5 | 6;
        title: string;
        anchor: string;
        start: number;
        length: number;
    }[] = [];

    slugger.reset();
    visit(tree, "heading", (heading) => {
        // headings.push(heading);

        if (!heading.position) {
            // eslint-disable-next-line no-console
            console.error("Expected heading to have position; Skipping...");
            return;
        }

        const title = toString(heading);
        const anchor = slugger.slug(title);
        const { start, length } = getPosition(lines, heading.position);
        headings.push({ depth: heading.depth, title, anchor, start, length });
    });

    // for each heading, extract the text that immediately follows it, but before the next heading
    // and add it to the records. If there is no next heading, use the rest of the document.
    // note: the content immediately before the first heading is also added to the records

    let heading = headings.shift();

    const breadcrumbStack: {
        // keep track of the depth of the current breadcrumb item, so we know when to stop popping
        depth: number;
        breadcrumb: Algolia.BreadcrumbsInfo;
    }[] = breadcrumb.map((breadcrumb) => ({
        depth: 0, // all the navigation-level breadcrumbs will have depth 0, whereas markdown headings will be 1-6.
        breadcrumb: {
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        },
    }));

    const slug = FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug);

    // meta descriptions will be pre-pended to the root node, so we need to collect them here:
    const metaDescriptions = [data.description, data.subtitle ?? data.excerpt, data["og:description"]];

    if (heading == null) {
        // TODO: truncate description
        const description = [...metaDescriptions, content]
            .filter(isNonNullish)
            .map((text) => text.trim())
            .filter((text) => text.length > 0)
            .join("\n\n");

        const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
        records.push({ type: "page-v4", title, slug, description, breadcrumbs, version, indexSegmentId });

        // no headings, so we're done
        return records;
    } else {
        const textBeforeFirstHeading = content.slice(0, heading.start).trim();

        // TODO: truncate description
        const description = [...metaDescriptions, textBeforeFirstHeading]
            .filter(isNonNullish)
            .map((text) => text.trim())
            .filter((text) => text.length > 0)
            .join("\n\n");

        const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
        records.push({ type: "page-v4", title, slug, description, breadcrumbs, version, indexSegmentId });
    }

    // add the first root node to the breadcrumb stack
    breadcrumbStack.push({ depth: 1, breadcrumb: { title, slug } });

    while (heading != null) {
        const nextHeading = headings.shift();

        // if the nextHeading is null, slice to the end of the document
        const textBeforeNextHeading = content.slice(heading.start + heading.length, nextHeading?.start).trim();

        // generate the record
        if (textBeforeNextHeading.length > 0) {
            const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
            records.push({
                type: "page-v4",
                title: heading.title,
                slug: FernNavigation.V1.Slug(`${slug}#${heading.anchor}`),
                // TODO: truncate description
                description: textBeforeNextHeading,
                breadcrumbs,
                version,
                indexSegmentId,
            });
        }

        // update the breadcrumb stack
        if (nextHeading != null) {
            // if the next heading is deeper than the current heading, push the current heading onto the stack
            if (nextHeading.depth > heading.depth) {
                breadcrumbStack.push({
                    depth: nextHeading.depth,
                    breadcrumb: { title: heading.title, slug: heading.anchor },
                });
            } else {
                // pop until we find the correct depth
                while (
                    breadcrumbStack.length > 0 &&
                    (breadcrumbStack[breadcrumbStack.length - 1]?.depth ?? 0) >= nextHeading.depth
                ) {
                    breadcrumbStack.pop();
                }
            }
        }

        heading = nextHeading;
    }

    return records;
}

function generateEndpointRecords(
    node: FernNavigation.EndpointNode,
    apiDefinition: ApiDefinition.ApiDefinition,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    indexSegmentId: Algolia.IndexSegmentId,
    isFieldRecordsEnabled: boolean,
): (Algolia.AlgoliaRecord.EndpointV4 | Algolia.AlgoliaRecord.EndpointFieldV1)[] {
    const endpoint = apiDefinition.endpoints[node.endpointId];

    if (endpoint == null) {
        // eslint-disable-next-line no-console
        console.error(`Endpoint node ${node.slug} has no endpoint ${node.endpointId}`);
        return [];
    }

    const endpointRecord: Algolia.AlgoliaRecord.EndpointV4 = {
        type: "endpoint-v4",
        method: endpoint.method,
        endpointPath: endpoint.path,
        isResponseStream: endpoint.response?.body.type === "stream" || endpoint.response?.body.type === "streamingText",
        title: node.title,
        description: toDescription([
            endpoint.description,
            endpoint.request?.description,
            endpoint.response?.description,
        ]),
        breadcrumbs: breadcrumb.map((breadcrumb) => ({
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        })),
        slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
        version,
        indexSegmentId,
    };

    if (!isFieldRecordsEnabled) {
        return [endpointRecord];
    }

    const fieldRecords: Algolia.AlgoliaRecord.EndpointFieldV1[] = [];

    function push(items: ApiDefinition.TypeDefinitionTreeItem[]) {
        items.forEach((item) => {
            const breadcrumbs = toBreadcrumbs(endpointRecord, item.path);
            const last = breadcrumbs[breadcrumbs.length - 1];

            if (!last) {
                throw new Error("Breadcrumb should have at least 1");
            }

            fieldRecords.push({
                ...endpointRecord,
                type: "endpoint-field-v1",
                title: last.title,
                description: toDescription(item.descriptions),
                breadcrumbs: breadcrumbs.slice(0, breadcrumbs.length - 1),
                slug: FernNavigation.V1.Slug(last.slug),
                availability: item.availability,
                extends: undefined,
            });
        });
    }

    endpoint.requestHeaders?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "header", displayName: "Headers" },
            ]),
        );
    });

    endpoint.queryParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "query", displayName: "Query Parameters" },
            ]),
        );
    });

    endpoint.pathParameters?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "path", displayName: "Path Parameters" },
            ]),
        );
    });

    if (endpoint.request) {
        switch (endpoint.request.body.type) {
            case "object":
            case "alias":
                push(
                    ApiDefinition.collectTypeDefinitionTree(endpoint.request.body, apiDefinition.types, {
                        path: [
                            { type: "meta", value: "request", displayName: "Request" },
                            { type: "meta", value: "body", displayName: undefined },
                        ],
                    }),
                );
                break;
            case "bytes":
            case "formData":
                // TODO: implement this
                break;
        }
    }

    endpoint.responseHeaders?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "response", displayName: "Response" },
                { type: "meta", value: "header", displayName: "Headers" },
            ]),
        );
    });

    if (endpoint.response) {
        switch (endpoint.response.body.type) {
            case "alias":
            case "object":
                push(
                    ApiDefinition.collectTypeDefinitionTree(endpoint.response.body, apiDefinition.types, {
                        path: [
                            { type: "meta", value: "response", displayName: "Response" },
                            { type: "meta", value: "body", displayName: undefined },
                        ],
                    }),
                );
                break;
            case "stream":
                push(
                    ApiDefinition.collectTypeDefinitionTree(endpoint.response.body.shape, apiDefinition.types, {
                        path: [
                            { type: "meta", value: "response", displayName: "Response" },
                            { type: "meta", value: "body", displayName: undefined },
                            { type: "meta", value: "stream", displayName: undefined },
                        ],
                    }),
                );
                break;
            case "fileDownload":
            case "streamingText":
                // TODO: implement this
                break;
        }
    }

    endpoint.errors?.forEach((error) => {
        if (error.shape != null) {
            if (error.description) {
                fieldRecords.push({
                    ...endpointRecord,
                    type: "endpoint-field-v1",
                    title: error.name,
                    description: toDescription([error.description]),
                    breadcrumbs: toBreadcrumbs(endpointRecord, [
                        { type: "meta", value: "response", displayName: "Response" },
                        { type: "meta", value: "error", displayName: "Errors" },
                    ]),
                    slug: FernNavigation.V1.Slug(
                        `${endpointRecord.slug}#response.error.${convertNameToAnchorPart(error.name) ?? error.statusCode}`,
                    ),
                    availability: error.availability,
                    extends: undefined,
                });
            }

            push(
                ApiDefinition.collectTypeDefinitionTree(error.shape, apiDefinition.types, {
                    path: [
                        { type: "meta", value: "response", displayName: "Response" },
                        { type: "meta", value: "error", displayName: "Errors" },
                        {
                            type: "meta",
                            value: convertNameToAnchorPart(error.name) ?? error.statusCode.toString(),
                            displayName: error.name,
                        },
                    ],
                }),
            );
        }
    });

    return [endpointRecord, ...fieldRecords];
}

export function convertNameToAnchorPart(name: string | null | undefined): string | undefined {
    if (name == null) {
        return undefined;
    }
    return upperFirst(camelCase(name));
}

function generateWebSocketRecords(
    node: FernNavigation.WebSocketNode,
    apiDefinition: ApiDefinition.ApiDefinition,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    indexSegmentId: Algolia.IndexSegmentId,
    isFieldRecordsEnabled: boolean,
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

function generateWebhookRecords(
    node: FernNavigation.WebhookNode,
    apiDefinition: ApiDefinition.ApiDefinition,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    indexSegmentId: Algolia.IndexSegmentId,
    isFieldRecordsEnabled: boolean,
): (Algolia.AlgoliaRecord.WebhookV4 | Algolia.AlgoliaRecord.WebhookFieldV1)[] {
    const webhook = apiDefinition.webhooks[node.webhookId];

    if (webhook == null) {
        // eslint-disable-next-line no-console
        console.error(`Webhook node ${node.slug} has no webhook ${node.webhookId}`);
        return [];
    }

    const webhookRecord: Algolia.AlgoliaRecord.WebhookV4 = {
        type: "webhook-v4",
        method: webhook.method,
        endpointPath: webhook.path.map((part) => ({ type: "literal", value: part })),
        title: node.title,
        description: toDescription([webhook.description, webhook.payload?.description]),
        breadcrumbs: breadcrumb.map((breadcrumb) => ({
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        })),
        slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
        version,
        indexSegmentId,
    };

    if (!isFieldRecordsEnabled) {
        return [webhookRecord];
    }

    const fieldRecords: Algolia.AlgoliaRecord.WebhookFieldV1[] = [];

    function push(items: ApiDefinition.TypeDefinitionTreeItem[]) {
        items.forEach((item) => {
            const breadcrumbs = toBreadcrumbs(webhookRecord, item.path);
            const last = breadcrumbs[breadcrumbs.length - 1];
            if (!last) {
                throw new Error("Breadcrumb should have at least 1");
            }

            fieldRecords.push({
                ...webhookRecord,
                type: "webhook-field-v1",
                title: last.title,
                description: toDescription(item.descriptions),
                breadcrumbs: breadcrumbs.slice(0, breadcrumbs.length - 1),
                slug: FernNavigation.V1.Slug(last.slug),
                availability: item.availability,
                extends: undefined,
            });
        });
    }

    webhook.headers?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "payload", displayName: "Payload" },
                { type: "meta", value: "header", displayName: "Headers" },
            ]),
        );
    });

    if (webhook.payload) {
        push(
            ApiDefinition.collectTypeDefinitionTree(webhook.payload.shape, apiDefinition.types, {
                path: [
                    { type: "meta", value: "payload", displayName: "Payload" },
                    { type: "meta", value: "body", displayName: undefined },
                ],
            }),
        );
    }

    return [webhookRecord, ...fieldRecords];
}

// TODO: improve the title
function toTitle(last: ApiDefinition.KeyPathItem): string {
    switch (last.type) {
        case "discriminatedUnionVariant":
            return last.discriminantDisplayName ?? titleCase(last.discriminantValue);
        case "enumValue":
            return last.value;
        case "extra":
            return "Extra Properties";
        case "list":
            return "List";
        case "mapValue":
            return "Map Value";
        case "meta":
            return last.displayName ?? titleCase(last.value);
        case "objectProperty":
            return last.key;
        case "set":
            return "Set";
        case "undiscriminatedUnionVariant":
            return last.displayName ?? `Variant ${last.idx}`;
    }
}

function toDescription(descriptions: (FernDocs.MarkdownText | undefined)[]): string | undefined {
    descriptions = descriptions.filter(isNonNullish);
    const stringDescriptions = descriptions.filter((d): d is string => typeof d === "string");

    if (stringDescriptions.length !== descriptions.length) {
        throw new Error(
            "Compiled markdown detected. When generating Algolia records, you must use the unresolved (uncompiled) version of the descriptions",
        );
    }

    if (stringDescriptions.length === 0) {
        return undefined;
    }

    return stringDescriptions.join("\n\n");
}

function toBreadcrumbs(
    record: Pick<Algolia.AlgoliaRecord.PageV4, "breadcrumbs" | "title" | "slug">,
    path: ApiDefinition.KeyPathItem[],
): Algolia.BreadcrumbsV2 {
    const records = [...record.breadcrumbs, { title: record.title, slug: record.slug }];

    const parts = [`${record.slug}#`];

    // don't include the last part of the path
    path.forEach((item) => {
        const title = toTitle(item);
        switch (item.type) {
            case "discriminatedUnionVariant": {
                // TODO: don't use the display name for discriminated unions (but this must mirror the frontend)
                parts.push(encodeURIComponent(title));
                records.push({ title, slug: parts.join(".") });
                break;
            }
            case "enumValue":
                parts.push(item.value);
                records.push({ title, slug: parts.join(".") });
                break;
            case "extra":
                parts.push("extra");
                records.push({ title, slug: parts.join(".") });
                break;
            case "list":
            case "set":
            case "mapValue":
                // the frontend currently doesn't append anything for lists or sets (will this cause collisions?)
                break;
            case "meta":
                parts.push(item.value);
                if (item.displayName) {
                    records.push({ title: item.displayName, slug: parts.join(".") });
                }
                break;
            case "objectProperty":
                parts.push(item.key);
                records.push({ title, slug: parts.join(".") });
                break;
            case "undiscriminatedUnionVariant":
                parts.push(encodeURIComponent(item.displayName ?? item.idx.toString()));
                if (item.displayName) {
                    records.push({ title, slug: parts.join(".") });
                }
                break;
            default:
                throw new UnreachableCaseError(item);
        }
    });

    return records;
}
