import {
    APIV1Read,
    Algolia,
    DocsV1Db,
    DocsV1Read,
    FdrAPI,
    FernNavigation,
    convertDbAPIDefinitionToRead,
    visitDbNavigationTab,
} from "@fern-api/fdr-sdk";
import { EndpointPathPart } from "@fern-api/fdr-sdk/src/client/APIV1Read";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { kebabCase } from "es-toolkit/string";
import { v4 as uuid } from "uuid";
import { BreadcrumbsInfo } from "../../api/generated/api";
import { LOGGER } from "../../app/FdrApplication";
import { assertNever, convertMarkdownToText, truncateToBytes } from "../../util";
import { compact } from "../../util/object";
import { AlgoliaSearchRecordGenerator, getFrontmatter } from "./AlgoliaSearchRecordGenerator";
import { NavigationContext } from "./NavigationContext";
import type { AlgoliaSearchRecord, IndexSegment, MarkdownNode, TypeReferenceWithMetadata } from "./types";

export class AlgoliaSearchRecordGeneratorV2 extends AlgoliaSearchRecordGenerator {
    protected generateAlgoliaSearchRecordsForSectionNavigationItem(
        item: DocsV1Db.NavigationItem.Section,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        if (item.hidden) {
            return [];
        }
        const section = item;
        const records = section.items.map((item) =>
            this.generateAlgoliaSearchRecordsForNavigationItem(
                item,
                context.withPathPart(
                    compact({
                        name: section.title,
                        urlSlug: section.urlSlug,
                        skipUrlSlug: section.skipUrlSlug || undefined,
                    }),
                ),
            ),
        );
        return records.flat(1);
    }

    protected generateAlgoliaSectionRecordsForApiNavigationItem(
        item: DocsV1Db.NavigationItem.Api,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        if (item.hidden) {
            return [];
        }
        const records: AlgoliaSearchRecord[] = [];
        const api = item;
        const apiId = api.api;
        const apiDef = this.config.apiDefinitionsById[apiId];
        if (apiDef != null) {
            records.push(
                ...this.generateAlgoliaSearchRecordsForApiDefinition(
                    apiDef,
                    context.withPathPart(
                        compact({
                            name: api.title,
                            urlSlug: api.urlSlug,
                            skipUrlSlug: api.skipUrlSlug || undefined,
                        }),
                    ),
                ),
            );
        }

        if (item.changelog != null) {
            records.push(
                ...this.generateAlgoliaSearchRecordsForChangelogSection(
                    item.changelog,
                    context,
                    `${api.title} Changelog`,
                ),
            );
        }

        return records;
    }

    protected parseMarkdownItem(
        rawMarkdown: string,
        breadcrumbs: BreadcrumbsInfo[],
        indexSegment: IndexSegment,
        rawSlug: string,
        title: string,
    ): AlgoliaSearchRecord[] {
        const version =
            indexSegment.type === "versioned"
                ? {
                      id: indexSegment.version.id,
                      slug: FernNavigation.V1.Slug(indexSegment.version.urlSlug ?? indexSegment.version.id),
                  }
                : undefined;
        const fdrSlug = FernNavigation.V1.Slug(rawSlug);

        // New markdown processing method
        const { frontmatter } = getFrontmatter(rawMarkdown);
        const markdownTree = getMarkdownSectionTree(rawMarkdown, title);
        const markdownSectionRecords = getMarkdownSections(markdownTree, breadcrumbs, indexSegment.id, fdrSlug).map(
            compact,
        );

        markdownSectionRecords.push(
            compact({
                type: "page-v4",
                objectID: uuid(),
                title: frontmatter.title ?? title,
                description: truncateToBytes(markdownTree.content, 9_500),
                breadcrumbs,
                slug: fdrSlug,
                version,
                indexSegmentId: indexSegment.id,
            }),
        );

        return markdownSectionRecords;
    }

    protected generateAlgoliaSectionRecordsForPageNavigationItem(
        item: DocsV1Db.NavigationItem.Page,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        if (item.hidden) {
            return [];
        }

        const page = item;
        const pageContent = this.config.docsDefinition.pages[page.id];
        if (pageContent == null) {
            return [];
        }

        const { indexSegment } = context;
        const pageContext =
            page.fullSlug != null
                ? context.withFullSlug(page.fullSlug)
                : context.withPathPart({
                      name: page.title,
                      urlSlug: page.urlSlug,
                      skipUrlSlug: undefined,
                  });

        const slug = pageContext.path;

        const markdownSectionRecords: AlgoliaSearchRecord[] = this.parseMarkdownItem(
            pageContent.markdown,
            [],
            indexSegment,
            slug,
            page.title,
        );

        const processedContent = convertMarkdownToText(pageContent.markdown);

        return markdownSectionRecords.concat([
            compact({
                type: "page-v2",
                objectID: uuid(),
                title: page.title, // TODO: parse from frontmatter?
                // TODO: Set to something more than 10kb on prod
                // See: https://support.algolia.com/hc/en-us/articles/4406981897617-Is-there-a-size-limit-for-my-index-records-/
                content: truncateToBytes(processedContent, 10_000 - 1),
                path: {
                    parts: pageContext.pathParts,
                },
                version:
                    indexSegment.type === "versioned"
                        ? {
                              id: indexSegment.version.id,
                              urlSlug: indexSegment.version.urlSlug ?? indexSegment.version.id,
                          }
                        : undefined,
                indexSegmentId: indexSegment.id,
            }),
        ]);
    }

    protected override generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
        config: DocsV1Db.UnversionedTabbedNavigationConfig,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records =
            config.tabsV2?.flatMap((tab) => {
                switch (tab.type) {
                    case "group":
                        return tab.items.flatMap((item) =>
                            this.generateAlgoliaSearchRecordsForNavigationItem(
                                item,
                                context.withPathPart({
                                    name: tab.title,
                                    urlSlug: tab.urlSlug,
                                    skipUrlSlug: tab.skipUrlSlug,
                                }),
                            ),
                        );
                    case "changelog":
                        return this.generateAlgoliaSearchRecordsForChangelogSection(
                            tab,
                            context.withPathPart({
                                name: tab.title ?? "Changelog",
                                urlSlug: tab.urlSlug,
                                skipUrlSlug: undefined,
                            }),
                        ).concat(
                            this.generateAlgoliaSearchRecordsForChangelogSectionV2(
                                tab,
                                context.withPathPart({
                                    name: tab.title ?? "Changelog",
                                    urlSlug: tab.urlSlug,
                                    skipUrlSlug: undefined,
                                }),
                            ),
                        );
                    default:
                        return [];
                }
            }) ??
            config.tabs?.map((tab) =>
                visitDbNavigationTab(tab, {
                    group: (group) => {
                        const tabRecords =
                            group.items?.map((item) =>
                                this.generateAlgoliaSearchRecordsForNavigationItem(
                                    item,
                                    context.withPathPart({
                                        name: tab.title,
                                        urlSlug: group.urlSlug,
                                        skipUrlSlug: undefined,
                                    }),
                                ),
                            ) ?? [];
                        return tabRecords.flat(1);
                    },
                    link: () => [],
                }),
            ) ??
            [];
        return records.flat(1);
    }

    // Main Entrypoint Function
    protected override generateAlgoliaSearchRecordsForNavigationItem(
        item: DocsV1Db.NavigationItem,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        switch (item.type) {
            case "section":
                return this.generateAlgoliaSearchRecordsForSectionNavigationItem(item, context);
            case "api":
                return this.generateAlgoliaSectionRecordsForApiNavigationItem(item, context);
            case "page":
                return this.generateAlgoliaSectionRecordsForPageNavigationItem(item, context);
            case "link":
                return [];
            case "changelog":
                return this.generateAlgoliaSearchRecordsForChangelogSection(item, context).concat(
                    this.generateAlgoliaSearchRecordsForChangelogSectionV2(item, context),
                );
            case "changelogV3":
                return this.generateAlgoliaSearchRecordsForChangelogNode(
                    item.node as FernNavigation.V1.ChangelogNode,
                    context,
                ).concat(
                    this.generateAlgoliaSearchRecordsForChangelogNodeV2(
                        item.node as FernNavigation.V1.ChangelogNode,
                        context,
                    ),
                );
            case "apiV2":
                return this.generateAlgoliaSearchRecordsForApiReferenceNode(
                    item.node as FernNavigation.V1.ApiReferenceNode,
                    context,
                ).concat(
                    this.generateAlgoliaSearchRecordsForApiReferenceNodeV2(
                        item.node as FernNavigation.V1.ApiReferenceNode,
                        context,
                    ),
                );
            default:
                assertNever(item);
        }
    }

    protected addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
        fields: AlgoliaSearchRecord[],
        typeReferences: TypeReferenceWithMetadata[],
        parameterWithDescriptionAndAvailability: {
            key: string;
            description: string | undefined;
            availability: FdrAPI.Availability | undefined;
        },
        version: Algolia.AlgoliaRecordVersionV3 | undefined,
        indexSegmentId: Algolia.IndexSegmentId,
        endpoint: APIV1Read.EndpointDefinition,
        anchorIdParts: string[],
        node: FernNavigation.V1.EndpointNode,
        parentBreadcrumbs: BreadcrumbsInfo[],
        type: APIV1Read.TypeReference,
    ) {
        const slug = anchorIdToSlug(node, anchorIdParts);
        const breadcrumbs = parentBreadcrumbs.concat(anchorIdParts.map((part) => ({ title: part, slug })));

        fields.push({
            objectID: uuid(),
            type: "endpoint-field-v1",
            title: parameterWithDescriptionAndAvailability.key,
            description: parameterWithDescriptionAndAvailability.description,
            availability: parameterWithDescriptionAndAvailability.availability,
            breadcrumbs,
            slug,
            version,
            indexSegmentId,
            method: endpoint.method,
            endpointPath: endpoint.path.parts,
            isResponseStream: node.isResponseStream,
            extends: undefined,
        });
        if (type.type === "id") {
            typeReferences.push({
                reference: type,
                anchorIdParts,
                breadcrumbs,
                slugPrefix: slug,
                version,
                indexSegmentId,
                method: endpoint.method,
                endpointPath: endpoint.path.parts,
                isResponseStream: node.isResponseStream,
                propertyKey: parameterWithDescriptionAndAvailability.key,
                type: "endpoint-field-v1",
            });
        }
    }

    protected addWebsocketFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
        fields: AlgoliaSearchRecord[],
        typeReferences: TypeReferenceWithMetadata[],
        parameterWithDescriptionAndAvailability: {
            key: string;
            description: string | undefined;
            availability: FdrAPI.Availability | undefined;
        },
        version: Algolia.AlgoliaRecordVersionV3 | undefined,
        indexSegmentId: Algolia.IndexSegmentId,
        websocket: APIV1Read.WebSocketChannel,
        anchorIdParts: string[],
        node: FernNavigation.V1.WebSocketNode,
        parentBreadcrumbs: BreadcrumbsInfo[],
        maybeTypeReference: APIV1Read.TypeReference,
    ) {
        const slug = anchorIdToSlug(node, anchorIdParts);
        const breadcrumbs = parentBreadcrumbs.concat(anchorIdParts.map((part) => ({ title: part, slug })));

        fields.push({
            objectID: uuid(),
            type: "websocket-field-v1",
            title: parameterWithDescriptionAndAvailability.key,
            description: parameterWithDescriptionAndAvailability.description,
            availability: parameterWithDescriptionAndAvailability.availability,
            breadcrumbs,
            slug,
            version,
            indexSegmentId,
            endpointPath: websocket.path.parts,
            extends: undefined,
        });
        if (maybeTypeReference.type === "id") {
            typeReferences.push({
                reference: maybeTypeReference,
                anchorIdParts,
                breadcrumbs,
                slugPrefix: slug,
                version,
                indexSegmentId,
                method: "GET",
                endpointPath: websocket.path.parts,
                propertyKey: parameterWithDescriptionAndAvailability.key,
                type: "websocket-field-v1",
            });
        }
    }

    protected addWebhookFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
        fields: AlgoliaSearchRecord[],
        typeReferences: TypeReferenceWithMetadata[],
        parameterWithDescriptionAndAvailability: {
            key: string;
            description: string | undefined;
            availability: FdrAPI.Availability | undefined;
        },
        version: Algolia.AlgoliaRecordVersionV3 | undefined,
        indexSegmentId: Algolia.IndexSegmentId,
        webhook: APIV1Read.WebhookDefinition,
        anchorIdParts: string[],
        node: FernNavigation.V1.WebhookNode,
        parentBreadcrumbs: BreadcrumbsInfo[],
        maybeTypeReference: APIV1Read.TypeReference,
    ) {
        const slug = anchorIdToSlug(node, anchorIdParts);
        const breadcrumbs = parentBreadcrumbs.concat(anchorIdParts.map((part) => ({ title: part, slug })));

        fields.push({
            objectID: uuid(),
            type: "webhook-field-v1",
            title: parameterWithDescriptionAndAvailability.key,
            description: parameterWithDescriptionAndAvailability.description,
            availability: parameterWithDescriptionAndAvailability.availability,
            breadcrumbs,
            slug,
            version,
            indexSegmentId,
            method: webhook.method,
            endpointPath: webhook.path.map((path) => ({
                type: "literal",
                value: path,
            })),
            extends: undefined,
        });
        if (maybeTypeReference.type === "id") {
            typeReferences.push({
                reference: maybeTypeReference,
                anchorIdParts,
                breadcrumbs,
                slugPrefix: slug,
                version,
                indexSegmentId,
                method: webhook.method,
                endpointPath: webhook.path.map((path) => ({
                    type: "literal",
                    value: path,
                })),
                propertyKey: parameterWithDescriptionAndAvailability.key,
                type: "websocket-field-v1",
            });
        }
    }

    protected generateAlgoliaSearchRecordsForApiReferenceNodeV2(
        root: FernNavigation.V1.ApiReferenceNode,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const api = this.config.apiDefinitionsById[root.apiDefinitionId];
        if (api == null) {
            LOGGER.error("Failed to find API definition for API reference node. id=", root.apiDefinitionId);
        }
        const holder =
            api != null ? FernNavigation.ApiDefinitionHolder.create(convertDbAPIDefinitionToRead(api)) : undefined;
        const records: AlgoliaSearchRecord[] = [];

        const baseBreadcrumbs = context.pathParts.map((part) => ({
            title: part.name,
            slug: part.urlSlug,
        }));

        const version =
            context.indexSegment.type === "versioned"
                ? ({
                      id: context.indexSegment.version.id,
                      slug: FernNavigation.V1.Slug(
                          context.indexSegment.version.urlSlug ?? context.indexSegment.version.id,
                      ),
                  } satisfies Algolia.AlgoliaRecordVersionV3)
                : undefined;

        FernNavigation.V1.traverseDF(root, (node, parents) => {
            if (!FernNavigation.V1.hasMetadata(node)) {
                return;
            }

            if (node.hidden) {
                return "skip";
            }

            if (FernNavigation.V1.isApiLeaf(node)) {
                const indexSegmentId = context.indexSegment.id;
                const breadcrumbs = toBreadcrumbs(
                    baseBreadcrumbs.concat({
                        title: node.title,
                        slug: node.slug,
                    }),
                    parents,
                );
                visitDiscriminatedUnion(node)._visit({
                    endpoint: (node) => {
                        const endpoint = holder?.endpoints.get(node.endpointId);
                        if (endpoint == null) {
                            LOGGER.error("Failed to find endpoint for API reference node.", node);
                            return;
                        }

                        // this is a hack to include the endpoint request/response json in the search index
                        // and potentially use it for conversational AI in the future.
                        // this needs to be rewritten as a template, with proper markdown formatting + snapshot testing.
                        // also, the content is potentially trimmed to 10kb.
                        const fields: AlgoliaSearchRecord[] = [];

                        const typeReferences: TypeReferenceWithMetadata[] = [];

                        if (endpoint.headers != null && endpoint.headers.length > 0) {
                            endpoint.headers.forEach((header) => {
                                this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    header,
                                    version,
                                    indexSegmentId,
                                    endpoint,
                                    ["request", "header", header.key],
                                    node,
                                    breadcrumbs,
                                    header.type,
                                );
                            });
                        }

                        if (endpoint.path.pathParameters.length > 0) {
                            endpoint.path.pathParameters.forEach((param) => {
                                this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    param,
                                    version,
                                    indexSegmentId,
                                    endpoint,
                                    ["request", "path", param.key],
                                    node,
                                    breadcrumbs,
                                    param.type,
                                );
                            });
                        }

                        if (endpoint.queryParameters.length > 0) {
                            endpoint.queryParameters.forEach((param) => {
                                this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    param,
                                    version,
                                    indexSegmentId,
                                    endpoint,
                                    ["request", "query", param.key],
                                    node,
                                    breadcrumbs,
                                    param.type,
                                );
                            });
                        }

                        if (endpoint.request != null) {
                            if (endpoint.request.type.type === "reference") {
                                const anchorIdParts = ["request", "body"];
                                const slug = anchorIdToSlug(node, anchorIdParts);
                                const fieldBreadcrumbs = breadcrumbs.concat(
                                    anchorIdParts.map((part) => ({ title: part, slug })),
                                );
                                typeReferences.push({
                                    reference: endpoint.request.type.value,
                                    anchorIdParts,
                                    breadcrumbs: fieldBreadcrumbs,
                                    slugPrefix: slug,
                                    version,
                                    indexSegmentId,
                                    method: endpoint.method,
                                    endpointPath: endpoint.path.parts,
                                    isResponseStream: node.isResponseStream,
                                    propertyKey: undefined,
                                    type: "endpoint-field-v1",
                                });
                            } else if (endpoint.request.type.type === "formData") {
                                endpoint.request.type.properties.forEach((property) => {
                                    if (property.type === "bodyProperty") {
                                        this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                            fields,
                                            typeReferences,
                                            property,
                                            version,
                                            indexSegmentId,
                                            endpoint,
                                            ["request", "body", property.key],
                                            node,
                                            breadcrumbs,
                                            property.valueType,
                                        );
                                    }
                                });
                            } else if (endpoint.request.type.type === "object") {
                                endpoint.request.type.properties.forEach((property) => {
                                    this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                        fields,
                                        typeReferences,
                                        property,
                                        version,
                                        indexSegmentId,
                                        endpoint,
                                        ["request", "body", property.key],
                                        node,
                                        breadcrumbs,
                                        property.valueType,
                                    );
                                });
                            }
                        }

                        if (endpoint.response != null) {
                            if (endpoint.response.type.type === "reference") {
                                const anchorIdParts = ["response", "body"];
                                const slug = anchorIdToSlug(node, anchorIdParts);
                                const fieldBreadcrumbs = breadcrumbs.concat(
                                    anchorIdParts.map((part) => ({ title: part, slug })),
                                );
                                typeReferences.push({
                                    reference: endpoint.response.type.value,
                                    anchorIdParts,
                                    breadcrumbs: fieldBreadcrumbs,
                                    slugPrefix: slug,
                                    version,
                                    indexSegmentId,
                                    method: endpoint.method,
                                    endpointPath: endpoint.path.parts,
                                    isResponseStream: node.isResponseStream,
                                    propertyKey: undefined,
                                    type: "endpoint-field-v1",
                                });
                            } else if (endpoint.response.type.type === "object") {
                                endpoint.response.type.properties.forEach((property) => {
                                    this.addEndpointFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                        fields,
                                        typeReferences,
                                        property,
                                        version,
                                        indexSegmentId,
                                        endpoint,
                                        ["response", "body", property.key],
                                        node,
                                        breadcrumbs,
                                        property.valueType,
                                    );
                                });
                            }
                        }

                        records.push(...fields.map(compact));
                        records.push(
                            ...this.collectReferencedTypesToContentV2(typeReferences, holder?.api.types ?? {}).map(
                                compact,
                            ),
                        );
                        records.push(
                            compact({
                                type: "endpoint-v4",
                                objectID: uuid(),
                                title: node.title,
                                description: endpoint.description,
                                breadcrumbs: toBreadcrumbs(breadcrumbs, parents),
                                slug: node.slug,
                                version,
                                indexSegmentId: context.indexSegment.id,
                                method: endpoint.method,
                                endpointPath: endpoint.path.parts,
                                isResponseStream: node.isResponseStream,
                            }),
                        );
                    },
                    webSocket: (node) => {
                        const ws = holder?.webSockets.get(node.webSocketId);
                        if (ws == null) {
                            LOGGER.error("Failed to find websocket for API reference node.", node);
                            return;
                        }

                        const typeReferences: TypeReferenceWithMetadata[] = [];

                        const fields: AlgoliaSearchRecord[] = [];

                        if (ws.headers.length > 0) {
                            ws.headers.forEach((param) => {
                                this.addWebsocketFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    param,
                                    version,
                                    indexSegmentId,
                                    ws,
                                    ["request", "header", param.key],
                                    node,
                                    breadcrumbs,
                                    param.type,
                                );
                            });
                        }

                        if (ws.path.pathParameters.length > 0) {
                            ws.path.pathParameters.forEach((param) => {
                                this.addWebsocketFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    param,
                                    version,
                                    indexSegmentId,
                                    ws,
                                    ["request", "path", param.key],
                                    node,
                                    breadcrumbs,
                                    param.type,
                                );
                            });
                        }

                        if (ws.queryParameters.length > 0) {
                            ws.queryParameters.forEach((param) => {
                                this.addWebsocketFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    param,
                                    version,
                                    indexSegmentId,
                                    ws,
                                    ["request", "query", param.key],
                                    node,
                                    breadcrumbs,
                                    param.type,
                                );
                            });
                        }

                        if (ws.messages.length > 0) {
                            ws.messages.forEach((message) => {
                                const messageType = message.origin === "server" ? "receive" : "send";
                                const slug = anchorIdToSlug(node, [messageType]);
                                if (message.body.type === "reference") {
                                    const anchorIdParts = [
                                        node.title,
                                        message.origin === "server" ? "receive" : "send",
                                    ];
                                    if (message.displayName != null) {
                                        anchorIdParts.push(message.displayName);
                                    }
                                    const fieldBreadcrumbs = breadcrumbs.concat(
                                        anchorIdParts.map((part) => ({ title: part, slug })),
                                    );
                                    typeReferences.push({
                                        reference: message.body.value,
                                        anchorIdParts,
                                        breadcrumbs: fieldBreadcrumbs,
                                        slugPrefix: anchorIdToSlug(node, anchorIdParts),
                                        version,
                                        indexSegmentId,
                                        endpointPath: ws.path.parts,
                                        type: "websocket-field-v1",
                                        propertyKey: undefined,
                                        method: "GET",
                                    });
                                } else if (message.body.type === "object") {
                                    message.body.properties.forEach((property) => {
                                        const anchorIdParts = [
                                            node.title,
                                            message.origin === "server" ? "receive" : "send",
                                        ];
                                        if (message.displayName != null) {
                                            anchorIdParts.push(message.displayName);
                                        }
                                        anchorIdParts.push(property.key);
                                        this.addWebsocketFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                            fields,
                                            typeReferences,
                                            property,
                                            version,
                                            indexSegmentId,
                                            ws,
                                            anchorIdParts,
                                            node,
                                            breadcrumbs,
                                            property.valueType,
                                        );
                                    });
                                } else {
                                    assertNever(message.body);
                                }
                            });
                        }

                        records.push(...fields.map(compact));
                        records.push(
                            ...this.collectReferencedTypesToContentV2(typeReferences, holder?.api.types ?? {}).map(
                                compact,
                            ),
                        );
                        records.push(
                            compact({
                                type: "websocket-v4",
                                objectID: uuid(),
                                title: node.title,
                                description: ws.description,
                                breadcrumbs: toBreadcrumbs(breadcrumbs, parents),
                                slug: node.slug,
                                version,
                                indexSegmentId: context.indexSegment.id,
                                endpointPath: ws.path.parts,
                            }),
                        );
                    },
                    webhook: (node) => {
                        const webhook = holder?.webhooks.get(node.webhookId);
                        if (webhook == null) {
                            LOGGER.error("Failed to find webhook for API reference node.", node);
                            return;
                        }

                        const typeReferences: TypeReferenceWithMetadata[] = [];
                        const fields: AlgoliaSearchRecord[] = [];
                        const endpointPath: EndpointPathPart[] = webhook.path.map((path) => ({
                            type: "literal",
                            value: path,
                        }));

                        if (webhook.headers.length > 0) {
                            //TODO(rohin): check webhook anchor ids
                            webhook.headers.forEach((header) => {
                                this.addWebhookFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    header,
                                    version,
                                    indexSegmentId,
                                    webhook,
                                    ["request", "header", header.key],
                                    node,
                                    breadcrumbs,
                                    header.type,
                                );
                            });
                        }

                        if (webhook.payload.type.type === "reference") {
                            const anchorIdParts = ["request", "body"];
                            const slug = anchorIdToSlug(node, anchorIdParts);
                            const fieldBreadcrumbs = breadcrumbs.concat(
                                anchorIdParts.map((part) => ({ title: part, slug })),
                            );
                            typeReferences.push({
                                reference: webhook.payload.type.value,
                                anchorIdParts,
                                breadcrumbs: fieldBreadcrumbs,
                                slugPrefix: slug,
                                version,
                                indexSegmentId,
                                method: webhook.method,
                                endpointPath,
                                propertyKey: undefined,
                                type: "websocket-field-v1",
                            });
                        } else if (webhook.payload.type.type === "object") {
                            webhook.payload.type.properties.forEach((property) => {
                                this.addWebhookFieldAndMaybeTypeReferenceToAlgoliaSearchRecords(
                                    fields,
                                    typeReferences,
                                    property,
                                    version,
                                    indexSegmentId,
                                    webhook,
                                    ["request", "body", property.key],
                                    node,
                                    breadcrumbs,
                                    property.valueType,
                                );
                            });
                        } else {
                            assertNever(webhook.payload.type);
                        }

                        records.push(...fields.map(compact));
                        records.push(
                            ...this.collectReferencedTypesToContentV2(typeReferences, holder?.api.types ?? {}).map(
                                compact,
                            ),
                        );
                        records.push(
                            compact({
                                type: "webhook-v4",
                                objectID: uuid(),
                                title: node.title,
                                description: webhook.description,
                                breadcrumbs: toBreadcrumbs(breadcrumbs, parents),
                                slug: node.slug,
                                version,
                                indexSegmentId: context.indexSegment.id,
                                method: webhook.method,
                                endpointPath,
                            }),
                        );
                    },
                });
            } else if (FernNavigation.V1.hasMarkdown(node)) {
                const pageId = FernNavigation.V1.getPageId(node);
                if (pageId == null) {
                    return;
                }

                const md = this.config.docsDefinition.pages[pageId]?.markdown;
                if (md == null) {
                    LOGGER.error("Failed to find markdown for node", node);
                    return;
                }

                const markdownSectionRecords = this.parseMarkdownItem(
                    md,
                    toBreadcrumbs([], parents),
                    context.indexSegment,
                    node.slug,
                    node.title,
                );

                records.push(...markdownSectionRecords);
            }
            return;
        });

        return records;
    }

    private collectReferencedTypeReferenceToContentV2(
        id: APIV1Read.TypeReference.Id,
        object: APIV1Read.TypeShape.Object_,
        fields: AlgoliaSearchRecord[],
        typeReferenceWithMetadata: TypeReferenceWithMetadata,
        baseSlug: string,
        additionalProperties: any,
        types: Record<string, APIV1Read.TypeDefinition>,
        visitedNodes: Set<string>,
        discriminatedUnionVariants: Set<string>,
        undiscriminatedUnionVariants: Set<string>,
        depth: number,
    ) {
        const referenceLeaves: TypeReferenceWithMetadata[] = [];
        object.properties.forEach((property) => {
            const slug = FernNavigation.V1.Slug(`${baseSlug}.${encodeURI(property.key)}`);
            // If we see and object shape for a property, we need to recursively collect the underlying referenced types.
            // If we see a reference or a container type, we will add it to the referenceLeaves to be processed in the next iteration.
            switch (property.valueType.type) {
                // here we check for reference types to process in the next iteration
                case "id":
                    referenceLeaves.push({
                        reference: property.valueType,
                        anchorIdParts: [...typeReferenceWithMetadata.anchorIdParts, property.key],
                        breadcrumbs: [
                            ...typeReferenceWithMetadata.breadcrumbs,
                            {
                                title: property.key,
                                slug: `${baseSlug}.${encodeURI(property.key)}`,
                            },
                        ],
                        slugPrefix: slug,
                        version: typeReferenceWithMetadata.version,
                        indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                        method: typeReferenceWithMetadata.method,
                        endpointPath: typeReferenceWithMetadata.endpointPath,
                        isResponseStream: typeReferenceWithMetadata.isResponseStream,
                        propertyKey: property.key,
                        type: typeReferenceWithMetadata.type,
                    });
                    break;
                // here we check for container types to process in the next iteration
                case "optional":
                case "map":
                case "list":
                case "set":
                    referenceLeaves.push({
                        reference: property.valueType,
                        anchorIdParts: [...typeReferenceWithMetadata.anchorIdParts],
                        breadcrumbs: [...typeReferenceWithMetadata.breadcrumbs],
                        slugPrefix: slug,
                        version: typeReferenceWithMetadata.version,
                        indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                        method: typeReferenceWithMetadata.method,
                        endpointPath: typeReferenceWithMetadata.endpointPath,
                        isResponseStream: typeReferenceWithMetadata.isResponseStream,
                        propertyKey: property.key,
                        type: typeReferenceWithMetadata.type,
                    });
                    break;
                // If we see the property is a primitive or literal, we add it to our collection of algolia records.
                case "primitive":
                case "literal":
                case "unknown":
                    fields.push({
                        objectID: uuid(),
                        title: property.key,
                        description: property.description,
                        availability: property.availability,
                        breadcrumbs: typeReferenceWithMetadata.breadcrumbs.concat({
                            title: property.key,
                            slug,
                        }),
                        slug,
                        version: typeReferenceWithMetadata.version,
                        indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                        extends: object.extends,
                        ...additionalProperties,
                    });
                    break;
                default: {
                    assertNever(property.valueType);
                }
            }
        });
        // If we see an extension on the object, we need to process the internal types.
        object.extends.forEach((extend) => {
            referenceLeaves.push({
                reference: { type: "id", value: extend, default: undefined },
                anchorIdParts: typeReferenceWithMetadata.anchorIdParts,
                breadcrumbs: typeReferenceWithMetadata.breadcrumbs,
                slugPrefix: baseSlug,
                version: typeReferenceWithMetadata.version,
                indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                method: typeReferenceWithMetadata.method,
                endpointPath: typeReferenceWithMetadata.endpointPath,
                isResponseStream: typeReferenceWithMetadata.isResponseStream,
                propertyKey: undefined,
                type: typeReferenceWithMetadata.type,
            });
        });

        fields.push(
            ...this.collectReferencedTypesToContentV2(
                referenceLeaves,
                types,
                new Set(visitedNodes).add(id.value),
                discriminatedUnionVariants,
                undiscriminatedUnionVariants,
                depth + 1,
            ),
        );
    }

    collectReferencedUndiscriminatedUnionToContentV2(
        undiscriminatedUnion: APIV1Read.TypeShape.UndiscriminatedUnion,
        fields: AlgoliaSearchRecord[],
        typeReferenceWithMetadata: TypeReferenceWithMetadata,
        baseSlug: string,
        additionalProperties: any,
        types: Record<string, APIV1Read.TypeDefinition>,
        visitedNodes: Set<string>,
        discriminatedUnionVariants: Set<string>,
        undiscriminatedUnionVariants: Set<string>,
        depth: number,
    ) {
        const referenceLeaves: TypeReferenceWithMetadata[] = [];
        const newVariantSet = new Set(undiscriminatedUnionVariants);
        undiscriminatedUnion.variants.forEach((variant, idx) => {
            const title =
                variant.displayName ??
                (variant.type.type === "id" ? titleCase(types[variant.type.value]?.name ?? "") : "");
            if (!undiscriminatedUnionVariants.has(title) || title == "") {
                newVariantSet.add(title);
                const slug = title != "" ? FernNavigation.V1.Slug(`${baseSlug}.${encodeURI(title)}`) : baseSlug;
                const anchorIdParts =
                    title != ""
                        ? [...typeReferenceWithMetadata.anchorIdParts, title]
                        : typeReferenceWithMetadata.anchorIdParts;
                const breadcrumbs =
                    title != ""
                        ? [...typeReferenceWithMetadata.breadcrumbs, { title, slug }]
                        : typeReferenceWithMetadata.breadcrumbs;
                // For undiscriminated unions, we need to check if there are any nested types that need to be processed.
                switch (variant.type.type) {
                    case "id":
                        referenceLeaves.push({
                            reference: variant.type,
                            anchorIdParts,
                            breadcrumbs,
                            slugPrefix: title != "" ? slug : baseSlug,
                            version: typeReferenceWithMetadata.version,
                            indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                            method: typeReferenceWithMetadata.method,
                            endpointPath: typeReferenceWithMetadata.endpointPath,
                            isResponseStream: typeReferenceWithMetadata.isResponseStream,
                            propertyKey: undefined,
                            type: typeReferenceWithMetadata.type,
                        });
                        break;
                    // here we check for container types to process in the next iteration
                    case "optional":
                        referenceLeaves.push({
                            reference: variant.type,
                            anchorIdParts,
                            breadcrumbs,
                            slugPrefix: slug,
                            version: typeReferenceWithMetadata.version,
                            indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                            method: typeReferenceWithMetadata.method,
                            endpointPath: typeReferenceWithMetadata.endpointPath,
                            isResponseStream: typeReferenceWithMetadata.isResponseStream,
                            propertyKey: undefined,
                            type: typeReferenceWithMetadata.type,
                        });
                        break;
                    case "map":
                    case "list":
                    case "set": {
                        const lastBreadcrumb = breadcrumbs.pop();
                        const newSlug = `${slug}.${idx}`;
                        if (lastBreadcrumb != null) {
                            lastBreadcrumb.slug = newSlug;
                            breadcrumbs.push(lastBreadcrumb);
                        }
                        referenceLeaves.push({
                            reference: variant.type,
                            anchorIdParts,
                            breadcrumbs,
                            slugPrefix: newSlug,
                            version: typeReferenceWithMetadata.version,
                            indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                            method: typeReferenceWithMetadata.method,
                            endpointPath: typeReferenceWithMetadata.endpointPath,
                            isResponseStream: typeReferenceWithMetadata.isResponseStream,
                            propertyKey: undefined,
                            type: typeReferenceWithMetadata.type,
                        });
                        break;
                    }
                    // If we see the variant is a primitive or literal, we add it to our collection of algolia records.
                    case "primitive":
                    case "literal":
                    case "unknown":
                        fields.push({
                            objectID: uuid(),
                            title,
                            description: variant.description,
                            availability: variant.availability,
                            breadcrumbs: [
                                ...typeReferenceWithMetadata.breadcrumbs,
                                {
                                    title,
                                    slug,
                                },
                            ],
                            slug,
                            version: typeReferenceWithMetadata.version,
                            indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                            extends: undefined,
                            ...additionalProperties,
                        });
                        break;
                    default:
                        assertNever(variant.type);
                }
            }
        });
        fields.push(
            ...this.collectReferencedTypesToContentV2(
                referenceLeaves,
                types,
                visitedNodes,
                discriminatedUnionVariants,
                newVariantSet,
                depth + 1,
            ),
        );
    }

    private collectReferencedDiscriminatedUnionToContentV2(
        discriminatedUnion: APIV1Read.TypeShape.DiscriminatedUnion,
        fields: AlgoliaSearchRecord[],
        typeReferenceWithMetadata: TypeReferenceWithMetadata,
        baseSlug: string,
        additionalProperties: any,
        types: Record<string, APIV1Read.TypeDefinition>,
        visitedNodes: Set<string>,
        discriminatedUnionVariants: Set<string>,
        undiscriminatedUnionVariants: Set<string>,
        depth: number,
    ) {
        const referenceLeaves: TypeReferenceWithMetadata[] = [];
        const newDiscriminatedUnionVariants = new Set(discriminatedUnionVariants);

        discriminatedUnion.variants.forEach((variant) => {
            if (!discriminatedUnionVariants.has(variant.discriminantValue)) {
                newDiscriminatedUnionVariants.add(variant.discriminantValue);
                const title = variant.discriminantValue ?? encodeURI(variant.displayName ?? "");
                const slug = FernNavigation.V1.Slug(`${baseSlug}.${title}`);

                // additional properties on the variant are the object shapes themselves,
                // so we check for extension types here.
                variant.additionalProperties.extends.forEach((extend) => {
                    referenceLeaves.push({
                        reference: { type: "id", value: extend, default: undefined },
                        anchorIdParts: typeReferenceWithMetadata.anchorIdParts,
                        breadcrumbs: [...typeReferenceWithMetadata.breadcrumbs, { title, slug }],
                        slugPrefix: `${baseSlug}.${title}`,
                        version: typeReferenceWithMetadata.version,
                        indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                        method: typeReferenceWithMetadata.method,
                        endpointPath: typeReferenceWithMetadata.endpointPath,
                        isResponseStream: typeReferenceWithMetadata.isResponseStream,
                        propertyKey: undefined,
                        type: typeReferenceWithMetadata.type,
                    });
                });
                variant.additionalProperties.properties.forEach((property) => {
                    // Here we check for references or container types to process in the next iteration.
                    switch (property.valueType.type) {
                        case "id":
                            referenceLeaves.push({
                                reference: property.valueType,
                                anchorIdParts: [...typeReferenceWithMetadata.anchorIdParts, title, property.key],
                                breadcrumbs: [
                                    ...typeReferenceWithMetadata.breadcrumbs,
                                    { title, slug },
                                    {
                                        title: property.key,
                                        slug: `${baseSlug}.${title}.${encodeURI(property.key)}`,
                                    },
                                ],
                                slugPrefix: `${baseSlug}.${title}.${encodeURI(property.key)}`,
                                version: typeReferenceWithMetadata.version,
                                indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                                method: typeReferenceWithMetadata.method,
                                endpointPath: typeReferenceWithMetadata.endpointPath,
                                isResponseStream: typeReferenceWithMetadata.isResponseStream,
                                propertyKey: property.key,
                                type: typeReferenceWithMetadata.type,
                            });
                            break;
                        // here we check for container types to process in the next iteration
                        case "optional":
                        case "map":
                        case "list":
                        case "set":
                            referenceLeaves.push({
                                reference: property.valueType,
                                anchorIdParts: [...typeReferenceWithMetadata.anchorIdParts, title],
                                breadcrumbs: [...typeReferenceWithMetadata.breadcrumbs, { title, slug }],
                                slugPrefix: `${baseSlug}.${title}`,
                                version: typeReferenceWithMetadata.version,
                                indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                                method: typeReferenceWithMetadata.method,
                                endpointPath: typeReferenceWithMetadata.endpointPath,
                                isResponseStream: typeReferenceWithMetadata.isResponseStream,
                                propertyKey: property.key,
                                type: typeReferenceWithMetadata.type,
                            });
                            break;
                        // otherwise we check for primitive or literal types to add to our collection of algolia records.
                        case "primitive":
                        case "literal":
                        case "unknown":
                            fields.push({
                                objectID: uuid(),
                                title: property.key,
                                description: property.description,
                                availability: property.availability,
                                breadcrumbs: typeReferenceWithMetadata.breadcrumbs.concat({
                                    title: property.key,
                                    slug,
                                }),
                                slug,
                                version: typeReferenceWithMetadata.version,
                                indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                                extends: variant.additionalProperties.extends,
                                ...additionalProperties,
                            });
                            break;
                        default:
                            assertNever(property.valueType);
                    }
                });
            }
        });

        fields.push(
            ...this.collectReferencedTypesToContentV2(
                referenceLeaves,
                types,
                visitedNodes,
                newDiscriminatedUnionVariants,
                undiscriminatedUnionVariants,
                depth + 1,
            ),
        );
    }

    // The idea behind this function is to collect the smallest subset of records that capture all type information.
    //
    // To do this, we descend the type tree and resolve the leaf nodes and map them to records that have built up breadcrumbs,
    // slugs, and other metadata that is useful for search indexing.
    protected collectReferencedTypesToContentV2(
        typeReferencesWithMetadata: TypeReferenceWithMetadata[],
        types: Record<string, APIV1Read.TypeDefinition>,
        visitedNodes: Set<string> = new Set(),
        discriminatedUnionVariants: Set<string> = new Set(),
        undiscriminatedUnionVariants: Set<string> = new Set(),
        depth: number = 0,
    ): AlgoliaSearchRecord[] {
        if (depth >= 8) {
            return [];
        }

        const fields: AlgoliaSearchRecord[] = [];

        typeReferencesWithMetadata.forEach((typeReferenceWithMetadata) => {
            // Based on the type of endpoint, we may have additional properties to add to the field,
            // this is the tersest way to add them.
            const endpointProperties = {
                type: "endpoint-field-v1" as const,
                method: typeReferenceWithMetadata.method,
                endpointPath: typeReferenceWithMetadata.endpointPath,
                isResponseStream: typeReferenceWithMetadata.isResponseStream,
            };
            const websocketProperties = {
                type: "websocket-field-v1" as const,
                endpointPath: typeReferenceWithMetadata.endpointPath,
            };
            const webhookProperties = {
                type: "webhook-field-v1" as const,
                method: typeReferenceWithMetadata.method,
                endpointPath: typeReferenceWithMetadata.endpointPath,
            };
            // Done for appropriate type checking
            const additionalProperties =
                typeReferenceWithMetadata.method != null
                    ? typeReferenceWithMetadata.type === "endpoint-field-v1"
                        ? endpointProperties
                        : webhookProperties
                    : websocketProperties;

            const baseSlug = typeReferenceWithMetadata.slugPrefix;

            visitDiscriminatedUnion(typeReferenceWithMetadata.reference)._visit({
                id: (id) => {
                    if (!visitedNodes.has(id.value)) {
                        const type = types[id.value];
                        if (type != null) {
                            visitDiscriminatedUnion(type.shape)._visit({
                                object: (object) => {
                                    this.collectReferencedTypeReferenceToContentV2(
                                        id,
                                        object,
                                        fields,
                                        typeReferenceWithMetadata,
                                        baseSlug,
                                        additionalProperties,
                                        types,
                                        visitedNodes,
                                        discriminatedUnionVariants,
                                        undiscriminatedUnionVariants,
                                        depth,
                                    );
                                },
                                alias: () => undefined,
                                enum: (enum_) => {
                                    enum_.values.forEach((value) => {
                                        const slug = FernNavigation.V1.Slug(baseSlug);
                                        // For enums, we want to make a record for each enum value, but individual enum values
                                        // do not have deep linked anchors.
                                        fields.push({
                                            objectID: uuid(),
                                            title: value.value,
                                            availability: value.availability,
                                            description: value.description,
                                            breadcrumbs: [
                                                ...typeReferenceWithMetadata.breadcrumbs,
                                                {
                                                    title: value.value,
                                                    slug,
                                                },
                                            ],
                                            slug,
                                            version: typeReferenceWithMetadata.version,
                                            indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                                            extends: undefined,
                                            ...additionalProperties,
                                        });
                                    });
                                },
                                undiscriminatedUnion: (undiscriminatedUnion) => {
                                    this.collectReferencedUndiscriminatedUnionToContentV2(
                                        undiscriminatedUnion,
                                        fields,
                                        typeReferenceWithMetadata,
                                        baseSlug,
                                        additionalProperties,
                                        types,
                                        visitedNodes,
                                        discriminatedUnionVariants,
                                        undiscriminatedUnionVariants,
                                        depth,
                                    );
                                },
                                discriminatedUnion: (discriminatedUnion) => {
                                    this.collectReferencedDiscriminatedUnionToContentV2(
                                        discriminatedUnion,
                                        fields,
                                        typeReferenceWithMetadata,
                                        baseSlug,
                                        additionalProperties,
                                        types,
                                        visitedNodes,
                                        discriminatedUnionVariants,
                                        undiscriminatedUnionVariants,
                                        depth,
                                    );
                                },
                            });
                        }
                    } else {
                        // In this case, we check to see if we've already visited the reference, we do not want to process it again.
                        // We treat this as a leaf node, and if the object came from a propert, we add the record as being keyed by the parent key.
                        if (typeReferenceWithMetadata.propertyKey != null) {
                            const type = types[id.value];

                            if (type) {
                                const slug = FernNavigation.V1.Slug(
                                    `${baseSlug}.${encodeURI(typeReferenceWithMetadata.propertyKey)}`,
                                );
                                fields.push({
                                    objectID: uuid(),
                                    title: typeReferenceWithMetadata.propertyKey,
                                    description: type.description,
                                    availability: type.availability,
                                    breadcrumbs: typeReferenceWithMetadata.breadcrumbs.concat({
                                        title: typeReferenceWithMetadata.propertyKey,
                                        slug,
                                    }),
                                    slug,
                                    version: typeReferenceWithMetadata.version,
                                    indexSegmentId: typeReferenceWithMetadata.indexSegmentId,
                                    extends: type.shape.type === "object" ? type.shape.extends : undefined,
                                    ...additionalProperties,
                                });
                            }
                        }
                    }
                },
                optional: (optional) => {
                    // Here, we want to unwrap the container type while preserving the parent breadcrumbs.
                    fields.push(
                        ...this.collectReferencedTypesToContentV2(
                            [
                                {
                                    ...typeReferenceWithMetadata,
                                    reference: optional.itemType,
                                },
                            ],
                            types,
                            visitedNodes,
                            discriminatedUnionVariants,
                            undiscriminatedUnionVariants,
                            depth + 1,
                        ),
                    );
                },
                list: (list) => {
                    // Append index here
                    // Here, we want to unwrap the container type while preserving the parent breadcrumbs
                    fields.push(
                        ...this.collectReferencedTypesToContentV2(
                            [
                                {
                                    ...typeReferenceWithMetadata,
                                    reference: list.itemType,
                                },
                            ],
                            types,
                            visitedNodes,
                            discriminatedUnionVariants,
                            undiscriminatedUnionVariants,
                            depth + 1,
                        ),
                    );
                },
                set: (set) => {
                    // Here, we want to unwrap the container type while preserving the parent breadcrumbs
                    fields.push(
                        ...this.collectReferencedTypesToContentV2(
                            [
                                {
                                    ...typeReferenceWithMetadata,
                                    reference: set.itemType,
                                },
                            ],
                            types,
                            visitedNodes,
                            discriminatedUnionVariants,
                            undiscriminatedUnionVariants,
                            depth + 1,
                        ),
                    );
                },
                map: (map) => {
                    // Here, we want to unwrap the container type while preserving the parent breadcrumbs
                    fields.push(
                        ...this.collectReferencedTypesToContentV2(
                            [
                                {
                                    ...typeReferenceWithMetadata,
                                    reference: map.valueType,
                                },
                            ],
                            types,
                            visitedNodes,
                            discriminatedUnionVariants,
                            undiscriminatedUnionVariants,
                            depth + 1,
                        ),
                    );
                    fields.push(
                        ...this.collectReferencedTypesToContentV2(
                            [
                                {
                                    ...typeReferenceWithMetadata,
                                    reference: map.valueType,
                                },
                            ],
                            types,
                            visitedNodes,
                            discriminatedUnionVariants,
                            undiscriminatedUnionVariants,
                            depth + 1,
                        ),
                    );
                },
                primitive: () => {
                    return;
                },
                literal: () => {
                    return;
                },
                unknown: () => {
                    return;
                },
            });
        });

        return fields;
    }

    protected generateAlgoliaSearchRecordsForChangelogNodeV2(
        root: FernNavigation.V1.ChangelogNode,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];

        const breadcrumbs = context.pathParts.map((part) => ({
            title: part.name,
            slug: part.urlSlug,
        }));

        FernNavigation.V1.traverseDF(root, (node) => {
            if (!FernNavigation.V1.hasMetadata(node)) {
                return;
            }

            if (node.hidden) {
                return "skip";
            }

            if (FernNavigation.V1.hasMarkdown(node)) {
                const pageId = FernNavigation.V1.getPageId(node);
                if (pageId == null) {
                    return;
                }

                const md = this.config.docsDefinition.pages[pageId]?.markdown;
                if (md == null) {
                    LOGGER.error("Failed to find markdown for node", node);
                    return;
                }

                const markdownSectionRecords = this.parseMarkdownItem(
                    md,
                    breadcrumbs,
                    context.indexSegment,
                    node.slug,
                    node.title,
                );

                records.push(...markdownSectionRecords);
            }
            return;
        });

        return records;
    }

    protected generateAlgoliaSearchRecordsForChangelogSectionV2(
        changelog: DocsV1Read.ChangelogSection,
        context: NavigationContext,
        fallbackTitle: string = "Changelog",
    ): AlgoliaSearchRecord[] {
        if (changelog.hidden) {
            return [];
        }
        const records: AlgoliaSearchRecord[] = [];
        if (changelog.pageId != null) {
            const changelogPageContent = this.config.docsDefinition.pages[changelog.pageId];
            const slug = FernNavigation.V1.Slug(changelog.urlSlug);
            const title = changelog.title ?? fallbackTitle;

            if (changelogPageContent != null) {
                const markdownSectionRecords = this.parseMarkdownItem(
                    changelogPageContent.markdown,
                    [],
                    context.indexSegment,
                    slug,
                    title,
                );

                records.push(...markdownSectionRecords);
            }

            changelog.items.forEach((changelogItem) => {
                const changelogTitle = `${title} - ${changelogItem.date}`;
                const slug = FernNavigation.V1.Slug(changelog.urlSlug);
                const changelogPageContent = this.config.docsDefinition.pages[changelogItem.pageId];
                if (changelogPageContent != null) {
                    const markdownSectionRecords = this.parseMarkdownItem(
                        changelogPageContent.markdown,
                        [],
                        context.indexSegment,
                        slug,
                        changelogTitle,
                    );

                    records.push(...markdownSectionRecords);
                }
            });
        }

        return records;
    }
}

function toBreadcrumbs(
    breadcrumbs: {
        title: string;
        slug: string;
    }[],
    parents: readonly FernNavigation.V1.NavigationNode[],
): BreadcrumbsInfo[] {
    return [
        ...breadcrumbs,
        ...parents
            .filter(FernNavigation.V1.hasMetadata)
            .filter((parent) =>
                parent.type === "apiReference"
                    ? parent.hideTitle !== true
                    : parent.type === "changelogMonth" || parent.type === "changelogYear"
                      ? false
                      : true,
            )
            .map((parent) => ({
                title: parent.title,
                slug: parent.slug,
            })),
    ];
}

function anchorIdToSlug(
    node: FernNavigation.V1.EndpointNode | FernNavigation.V1.WebSocketNode | FernNavigation.V1.WebhookNode,
    anchorIdParts: string[],
): FernNavigation.V1.Slug {
    return FernNavigation.V1.Slug(`${node.slug}#${encodeURI(anchorIdParts.join("."))}`);
}

export function getMarkdownSectionTree(markdown: string, pageTitle: string): MarkdownNode {
    const { frontmatter, content } = getFrontmatter(markdown);
    const lines: string[] = content.split("\n");
    let insideCodeBlock = false;
    const root: MarkdownNode = { level: 0, heading: frontmatter.title ?? pageTitle, content: "", children: [] };
    const collectedNodes = [root];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("```") || trimmedLine.startsWith("~~~")) {
            insideCodeBlock = !insideCodeBlock;
        }

        let currentNode = collectedNodes.pop();
        if (!insideCodeBlock && trimmedLine.startsWith("#")) {
            const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                const level = headerMatch[1]?.length;
                const heading = headerMatch[2]?.trim();
                if (currentNode != null && level != null && heading != null) {
                    while (currentNode != null && currentNode.level >= level) {
                        currentNode = collectedNodes.pop();
                    }
                    const newNode = { level, heading, content: "", children: [] };
                    if (currentNode != null && currentNode.level < level) {
                        currentNode.children.push(newNode);
                    }

                    if (currentNode) {
                        collectedNodes.push(currentNode);
                        collectedNodes.push(newNode);
                    }
                    continue;
                }
            }
        }

        if (currentNode) {
            currentNode.content += trimmedLine + "\n";
            collectedNodes.push(currentNode);
        }
    }

    return root;
}

function sanitizeText(text: string): string {
    return text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
}

export function getMarkdownSections(
    markdownSection: MarkdownNode,
    breadcrumbs: BreadcrumbsInfo[],
    indexSegmentId: FdrAPI.IndexSegmentId,
    slug: FernNavigation.V1.Slug,
): AlgoliaSearchRecord[] {
    const markdownSlug = FernNavigation.V1.Slug(
        markdownSection.level === 0 ? slug : `${slug}#${encodeURI(kebabCase(markdownSection.heading.toLowerCase()))}`,
    );
    const sectionBreadcrumbs = markdownSection.heading
        ? breadcrumbs.concat([
              {
                  title: markdownSection.heading,
                  slug: markdownSlug,
              },
          ])
        : breadcrumbs.slice(0);

    const records: AlgoliaSearchRecord[] =
        markdownSection.content.trim().length === 0
            ? []
            : [
                  compact({
                      type: "markdown-section-v1",
                      objectID: uuid(),
                      title: markdownSection.heading.trim(),
                      content: sanitizeText(markdownSection.content.trim()),
                      breadcrumbs: sectionBreadcrumbs,
                      indexSegmentId,
                      slug: markdownSlug,
                      description: undefined,
                      version: undefined,
                  }),
              ];
    return records.concat(
        markdownSection.children.reduce((acc: AlgoliaSearchRecord[], markdownSectionChild: MarkdownNode) => {
            return acc.concat(getMarkdownSections(markdownSectionChild, sectionBreadcrumbs, indexSegmentId, slug));
        }, []),
    );
}
