import {
    APIV1Db,
    APIV1Read,
    Algolia,
    DocsV1Db,
    DocsV1Read,
    FernNavigation,
    convertDbAPIDefinitionToRead,
    visitDbNavigationTab,
    visitUnversionedDbNavigationConfig,
} from "@fern-api/fdr-sdk";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import grayMatter from "gray-matter";
import { noop } from "lodash-es";
import { v4 as uuid } from "uuid";
import { LOGGER } from "../../app/FdrApplication";
import { assertNever, convertMarkdownToText, truncateToBytes } from "../../util";
import { compact } from "../../util/object";
import { NavigationContext } from "./NavigationContext";
import { ReferencedTypes, getAllReferencedTypes } from "./getAllReferencedTypes";
import type { AlgoliaSearchRecord, IndexSegment } from "./types";

interface AlgoliaSearchRecordGeneratorConfig {
    docsDefinition: DocsV1Db.DocsDefinitionDb;
    apiDefinitionsById: Record<string, APIV1Db.DbApiDefinition>;
}

export class AlgoliaSearchRecordGenerator {
    public constructor(protected readonly config: AlgoliaSearchRecordGeneratorConfig) {}

    public generateAlgoliaSearchRecordsForSpecificDocsVersion(
        navigationConfig: DocsV1Db.UnversionedNavigationConfig,
        indexSegment: IndexSegment,
    ): AlgoliaSearchRecord[] {
        const context = new NavigationContext(indexSegment, []);
        return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(navigationConfig, context);
    }

    protected generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
        config: DocsV1Db.UnversionedNavigationConfig,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        return visitUnversionedDbNavigationConfig(config, {
            tabbed: (tabbedConfig) => {
                return this.generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(tabbedConfig, context);
            },
            untabbed: (untabbedConfig) => {
                return this.generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(untabbedConfig, context);
            },
        });
    }

    protected generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(
        config: DocsV1Db.UnversionedUntabbedNavigationConfig,
        context: NavigationContext,
    ) {
        const records = config.items.map((item) => this.generateAlgoliaSearchRecordsForNavigationItem(item, context));
        return records.flat(1);
    }

    protected generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
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
                        );
                    default:
                        return [];
                }
            }) ??
            config.tabs?.map((tab) =>
                visitDbNavigationTab(tab, {
                    group: (group) => {
                        const tabRecords = group.items.map((item) =>
                            this.generateAlgoliaSearchRecordsForNavigationItem(
                                item,
                                context.withPathPart({
                                    name: tab.title,
                                    urlSlug: group.urlSlug,
                                    skipUrlSlug: undefined,
                                }),
                            ),
                        );
                        return tabRecords.flat(1);
                    },
                    link: () => [],
                }),
            ) ??
            [];
        return records.flat(1);
    }

    protected generateAlgoliaSearchRecordsForNavigationItem(
        item: DocsV1Db.NavigationItem,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        if (item.type === "section") {
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
        } else if (item.type === "api") {
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
        } else if (item.type === "page") {
            if (item.hidden) {
                return [];
            }

            const page = item;
            const pageContent = this.config.docsDefinition.pages[page.id];
            if (pageContent == null) {
                return [];
            }

            const pageContext =
                page.fullSlug != null
                    ? context.withFullSlug(page.fullSlug)
                    : context.withPathPart({
                          name: page.title,
                          urlSlug: page.urlSlug,
                          skipUrlSlug: undefined,
                      });
            const processedContent = convertMarkdownToText(pageContent.markdown);
            const { indexSegment } = context;

            return [
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
            ];
        } else if (item.type === "link") {
            return [];
        } else if (item.type === "changelog") {
            return this.generateAlgoliaSearchRecordsForChangelogSection(item, context);
        } else if (item.type === "changelogV3") {
            return this.generateAlgoliaSearchRecordsForChangelogNode(
                item.node as FernNavigation.V1.ChangelogNode,
                context,
            );
        } else if (item.type === "apiV2") {
            return this.generateAlgoliaSearchRecordsForApiReferenceNode(
                item.node as FernNavigation.V1.ApiReferenceNode,
                context,
            );
        }
        assertNever(item);
    }

    protected generateAlgoliaSearchRecordsForApiReferenceNode(
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

        const breadcrumbs = context.pathParts.map((part) => part.name);

        const version =
            context.indexSegment.type === "versioned"
                ? ({
                      id: context.indexSegment.version.id,
                      slug: FernNavigation.V1.Slug(
                          context.indexSegment.version.urlSlug ?? context.indexSegment.version.id,
                      ),
                  } satisfies Algolia.AlgoliaRecordVersionV3)
                : undefined;

        function toBreadcrumbs(parents: readonly FernNavigation.V1.NavigationNode[]): string[] {
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
                    .map((parent) => parent.title),
            ];
        }

        FernNavigation.V1.traverseDF(root, (node, parents) => {
            if (!FernNavigation.V1.hasMetadata(node)) {
                return;
            }

            if (node.hidden) {
                return "skip";
            }

            if (FernNavigation.V1.isApiLeaf(node)) {
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
                        const contents = [endpoint.description ?? ""];

                        const typeReferences: APIV1Read.TypeReference[] = [];

                        if (endpoint.headers != null && endpoint.headers.length > 0) {
                            contents.push("## Headers\n");
                            endpoint.headers.forEach((header) => {
                                typeReferences.push(header.type);
                                contents.push(
                                    `- ${header.key}=${this.stringifyTypeRef(header.type)} ${header.description ?? ""}`,
                                );
                            });
                        }

                        if (endpoint.path.pathParameters.length > 0) {
                            contents.push("## Path Parameters\n");
                            endpoint.path.pathParameters.forEach((param) => {
                                typeReferences.push(param.type);
                                contents.push(
                                    `- ${param.key}=${this.stringifyTypeRef(param.type)} ${param.description ?? ""}`,
                                );
                            });
                        }

                        if (endpoint.queryParameters.length > 0) {
                            contents.push("## Query Parameters\n");
                            endpoint.queryParameters.forEach((param) => {
                                typeReferences.push(param.type);
                                contents.push(
                                    `- ${param.key}=${this.stringifyTypeRef(param.type)} ${param.description ?? ""}`,
                                );
                            });
                        }

                        if (endpoint.request != null) {
                            contents.push("## Request\n");
                            if (endpoint.request.description != null) {
                                contents.push(`${endpoint.request.description}\n`);
                            }

                            contents.push("### Body\n");

                            if (endpoint.request.type.type === "reference") {
                                typeReferences.push(endpoint.request.type.value);
                                contents.push(
                                    `${this.stringifyTypeRef(endpoint.request.type.value)}: ${endpoint.request.description ?? ""}`,
                                );
                            } else if (endpoint.request.type.type === "formData") {
                                endpoint.request.type.properties.forEach((property) => {
                                    if (property.type === "bodyProperty") {
                                        typeReferences.push(property.valueType);
                                        contents.push(
                                            `- ${property.key}=${this.stringifyTypeRef(property.valueType)} ${property.description ?? ""}`,
                                        );
                                    }
                                });
                            } else if (endpoint.request.type.type === "object") {
                                endpoint.request.type.extends.forEach((extend) => {
                                    contents.push(`- ${extend}`);
                                });
                                endpoint.request.type.properties.forEach((property) => {
                                    typeReferences.push(property.valueType);
                                    contents.push(
                                        `- ${property.key}=${this.stringifyTypeRef(property.valueType)} ${property.description ?? ""}`,
                                    );
                                });
                            }
                        }

                        if (endpoint.response != null) {
                            contents.push("## Response\n");
                            if (endpoint.response.description != null) {
                                contents.push(`${endpoint.response.description}\n`);
                            }

                            contents.push("### Body\n");

                            if (endpoint.response.type.type === "reference") {
                                typeReferences.push(endpoint.response.type.value);
                                contents.push(
                                    `${this.stringifyTypeRef(endpoint.response.type.value)}: ${endpoint.response.description ?? ""}`,
                                );
                            } else if (endpoint.response.type.type === "object") {
                                endpoint.response.type.extends.forEach((extend) => {
                                    contents.push(`- ${extend}`);
                                });
                                endpoint.response.type.properties.forEach((property) => {
                                    typeReferences.push(property.valueType);
                                    contents.push(
                                        `- ${property.key}=${this.stringifyTypeRef(property.valueType)} ${property.description ?? ""}`,
                                    );
                                });
                            }
                        }

                        contents.push(this.collectReferencedTypesToContent(typeReferences, holder?.api.types ?? {}));

                        records.push(
                            compact({
                                type: "endpoint-v3",
                                objectID: uuid(),
                                title: node.title,
                                content: truncateToBytes(contents.join("\n"), 10_000 - 1),
                                breadcrumbs: toBreadcrumbs(parents),
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

                        const contents = [ws.description ?? ""];

                        const typeReferences: APIV1Read.TypeReference[] = [];

                        if (ws.headers.length > 0) {
                            contents.push("## Headers\n");
                            ws.headers.forEach((param) => {
                                typeReferences.push(param.type);
                                contents.push(
                                    `- ${param.key}=${this.stringifyTypeRef(param.type)} ${param.description ?? ""}`,
                                );
                            });
                        }

                        if (ws.path.pathParameters.length > 0) {
                            contents.push("## Path Parameters\n");
                            ws.path.pathParameters.forEach((param) => {
                                typeReferences.push(param.type);
                                contents.push(
                                    `- ${param.key}=${this.stringifyTypeRef(param.type)} ${param.description ?? ""}`,
                                );
                            });
                        }

                        if (ws.queryParameters.length > 0) {
                            contents.push("## Query Parameters\n");
                            ws.queryParameters.forEach((param) => {
                                typeReferences.push(param.type);
                                contents.push(
                                    `- ${param.key}=${this.stringifyTypeRef(param.type)} ${param.description ?? ""}`,
                                );
                            });
                        }

                        if (ws.messages.length > 0) {
                            contents.push("## Messages\n");
                            ws.messages.forEach((message) => {
                                contents.push(
                                    `### ${message.displayName ?? ""} (${message.type}) - ${message.origin}\n`,
                                );
                                if (message.description != null) {
                                    contents.push(message.description);
                                }
                                if (message.body.type === "reference") {
                                    const anchorIdParts = [message.origin === "server" ? "receive" : "send"];
                                    if (message.displayName != null) {
                                        anchorIdParts.push(message.displayName);
                                    }
                                    typeReferences.push(message.body.value);
                                    contents.push(`- ${this.stringifyTypeRef(message.body.value)}`);
                                } else if (message.body.type === "object") {
                                    message.body.extends.forEach((extend) => {
                                        contents.push(`- ${extend}`);
                                    });
                                    message.body.properties.forEach((property) => {
                                        typeReferences.push(property.valueType);
                                        contents.push(
                                            `- ${property.key}=${this.stringifyTypeRef(property.valueType)} ${property.description ?? ""}`,
                                        );
                                    });
                                } else {
                                    assertNever(message.body);
                                }
                            });
                        }

                        contents.push(this.collectReferencedTypesToContent(typeReferences, holder?.api.types ?? {}));

                        records.push(
                            compact({
                                type: "websocket-v3",
                                objectID: uuid(),
                                title: node.title,
                                content: truncateToBytes(contents.join("\n"), 10_000 - 1),
                                breadcrumbs: toBreadcrumbs(parents),
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

                        const contents = [webhook.description ?? ""];
                        const typeReferences: APIV1Read.TypeReference[] = [];

                        if (webhook.headers.length > 0) {
                            contents.push("## Headers\n");
                            webhook.headers.forEach((header) => {
                                typeReferences.push(header.type);
                                contents.push(
                                    `- ${header.key}=${this.stringifyTypeRef(header.type)} ${header.description ?? ""}`,
                                );
                            });
                        }

                        contents.push("## Payload\n");

                        if (webhook.payload.description != null) {
                            contents.push(webhook.payload.description);
                        }

                        if (webhook.payload.type.type === "reference") {
                            typeReferences.push(webhook.payload.type.value);
                            contents.push(
                                `${this.stringifyTypeRef(webhook.payload.type.value)}: ${webhook.payload.description ?? ""}`,
                            );
                        } else if (webhook.payload.type.type === "object") {
                            webhook.payload.type.extends.forEach((extend) => {
                                contents.push(`- ${extend}`);
                            });
                            webhook.payload.type.properties.forEach((property) => {
                                typeReferences.push(property.valueType);
                                contents.push(
                                    `- ${property.key}=${this.stringifyTypeRef(property.valueType)} ${property.description ?? ""}`,
                                );
                            });
                        } else {
                            assertNever(webhook.payload.type);
                        }

                        contents.push(this.collectReferencedTypesToContent(typeReferences, holder?.api.types ?? {}));

                        records.push(
                            compact({
                                type: "webhook-v3",
                                objectID: uuid(),
                                title: node.title,
                                content: truncateToBytes(contents.join("\n"), 10_000 - 1),
                                breadcrumbs: toBreadcrumbs(parents),
                                slug: node.slug,
                                version,
                                indexSegmentId: context.indexSegment.id,
                                method: webhook.method,
                                endpointPath: webhook.path.map((path) => ({ type: "literal", value: path })),
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

                const { frontmatter } = getFrontmatter(md);

                records.push(
                    compact({
                        type: "page-v3",
                        objectID: uuid(),
                        title: frontmatter.title ?? node.title,
                        content: truncateToBytes(md, 10_000 - 1),
                        breadcrumbs: toBreadcrumbs(parents),
                        slug: node.slug,
                        version,
                        indexSegmentId: context.indexSegment.id,
                    }),
                );
            }
            return;
        });

        return records;
    }

    protected stringifyTypeRef(typeRef: APIV1Read.TypeReference): string {
        return visitDiscriminatedUnion(typeRef)._visit({
            literal: (value) => value.value.value.toString(),
            id: (value) => value.value,
            primitive: (value) => value.value.type,
            optional: (value) => `${this.stringifyTypeRef(value.itemType)}?`,
            list: (value) => `${this.stringifyTypeRef(value.itemType)}[]`,
            set: (value) => `Set<${this.stringifyTypeRef(value.itemType)}>`,
            map: (value) => `Map<${this.stringifyTypeRef(value.keyType)}, ${this.stringifyTypeRef(value.valueType)}>`,
            unknown: () => "unknown",
        });
    }

    protected collectReferencedTypesToContent(
        typeReferences: APIV1Read.TypeReference[],
        types: Record<string, APIV1Read.TypeDefinition>,
    ): string {
        let referencedTypes: ReferencedTypes = {};

        typeReferences.forEach((typeReference) => {
            const allReferencedTypes = getAllReferencedTypes({
                reference: typeReference,
                types,
            });
            referencedTypes = {
                ...referencedTypes,
                ...allReferencedTypes,
            };
        });

        const contents = [];
        if (Object.keys(referencedTypes).length > 0) {
            contents.push("## Referenced Types\n");
            Object.entries(referencedTypes).forEach(([key, value]) => {
                contents.push(`### ${key}\n`);

                if (value.description != null) {
                    contents.push(value.description);
                }

                visitDiscriminatedUnion(value.shape)._visit({
                    object: (object) => {
                        object.extends.forEach((extend) => {
                            contents.push(`- ${extend}`);
                        });
                        object.properties.forEach((property) => {
                            contents.push(
                                `- ${property.key}: ${this.stringifyTypeRef(property.valueType)} - ${property.description ?? ""}`,
                            );
                        });
                    },
                    alias: noop,
                    enum: (enum_) => {
                        enum_.values.forEach((value) => {
                            contents.push(`- ${value}`);
                        });
                    },
                    undiscriminatedUnion: (value) => {
                        value.variants.forEach((variant) => {
                            if (variant.displayName != null) {
                                contents.push(`#### ${variant.displayName}\n`);
                            } else if (variant.type.type === "id") {
                                contents.push(`#### ${variant.type.value}\n`);
                            }
                            contents.push(
                                `Type: ${this.stringifyTypeRef(variant.type)} - ${variant.description ?? ""}`,
                            );
                        });
                    },
                    discriminatedUnion: (value) => {
                        value.variants.forEach((variant) => {
                            contents.push(`#### ${variant.displayName ?? titleCase(variant.discriminantValue)}\n`);
                            if (variant.description != null) {
                                contents.push(variant.description);
                            }
                            variant.additionalProperties.extends.forEach((extend) => {
                                contents.push(`- ${extend}`);
                            });
                            variant.additionalProperties.properties.forEach((property) => {
                                contents.push(
                                    `- ${property.key}: ${this.stringifyTypeRef(property.valueType)} - ${property.description ?? ""}`,
                                );
                            });
                        });
                    },
                });
            });
        }

        return contents.join("\n");
    }

    protected generateAlgoliaSearchRecordsForChangelogNode(
        root: FernNavigation.V1.ChangelogNode,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];

        const breadcrumbs = context.pathParts.map((part) => part.name);

        const version =
            context.indexSegment.type === "versioned"
                ? {
                      id: context.indexSegment.version.id,
                      slug: FernNavigation.V1.Slug(
                          context.indexSegment.version.urlSlug ?? context.indexSegment.version.id,
                      ),
                  }
                : undefined;

        function toBreadcrumbs(parents: readonly FernNavigation.V1.NavigationNode[]): string[] {
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
                    .map((parent) => parent.title),
            ];
        }

        FernNavigation.V1.traverseDF(root, (node, parents) => {
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

                records.push(
                    compact({
                        type: "page-v3",
                        objectID: uuid(),
                        title: node.title,
                        content: md,
                        breadcrumbs: toBreadcrumbs(parents),
                        slug: node.slug,
                        version,
                        indexSegmentId: context.indexSegment.id,
                    }),
                );
            }
            return;
        });

        return records;
    }

    protected generateAlgoliaSearchRecordsForChangelogSection(
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
            const urlSlug = changelog.urlSlug;
            const title = changelog.title ?? fallbackTitle;

            if (changelogPageContent != null) {
                const processedContent = convertMarkdownToText(changelogPageContent.markdown);
                const { indexSegment } = context;
                const pageContext = context.withPathPart({
                    // TODO: parse from frontmatter?
                    name: title,
                    urlSlug,
                    skipUrlSlug: undefined,
                });
                records.push(
                    compact({
                        type: "page-v2",
                        objectID: uuid(),
                        title,
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
                );
            }

            changelog.items.forEach((changelogItem) => {
                const changelogItemContext = context.withPathPart({
                    name: `${title} - ${changelogItem.date}`,
                    urlSlug,
                    skipUrlSlug: undefined,
                });

                const changelogPageContent = this.config.docsDefinition.pages[changelogItem.pageId];
                if (changelogPageContent != null) {
                    const processedContent = convertMarkdownToText(changelogPageContent.markdown);
                    const { indexSegment } = context;

                    records.push(
                        compact({
                            type: "page-v2",
                            objectID: uuid(),
                            title: `${title} - ${changelogItem.date}`,
                            // TODO: Set to something more than 10kb on prod
                            // See: https://support.algolia.com/hc/en-us/articles/4406981897617-Is-there-a-size-limit-for-my-index-records-/
                            content: truncateToBytes(processedContent, 10_000 - 1),
                            path: {
                                parts: changelogItemContext.pathParts,
                                // TODO: add anchor
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
                    );
                }
            });
        }

        return records;
    }

    protected generateAlgoliaSearchRecordsForApiDefinition(
        apiDef: APIV1Db.DbApiDefinition,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const { rootPackage, subpackages } = apiDef;
        const subpackagePathParts = getPathPartsBySubpackage({ definition: apiDef });

        const records: AlgoliaSearchRecord[] = [];

        rootPackage.endpoints.forEach((e) => {
            const endpointRecords = this.generateAlgoliaSearchRecordsForEndpointDefinition(e, context);
            records.push(...endpointRecords);
        });

        Object.entries(subpackages).forEach(([id, subpackage]) => {
            const pathParts = subpackagePathParts[APIV1Db.SubpackageId(id)];
            if (pathParts == null) {
                LOGGER.error("Excluding subpackage from search. Failed to find path parts for subpackage id=", id);
                return;
            }
            subpackage.endpoints.forEach((e) => {
                const endpointRecords = this.generateAlgoliaSearchRecordsForEndpointDefinition(
                    e,
                    context.withPathParts(pathParts),
                );
                records.push(...endpointRecords);
            });
        });

        return records;
    }

    protected generateAlgoliaSearchRecordsForEndpointDefinition(
        endpointDef: APIV1Db.DbEndpointDefinition,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];
        if (endpointDef.name != null || endpointDef.description != null) {
            const endpointContext = context.withPathPart({
                name: endpointDef.name ?? "",
                urlSlug: endpointDef.urlSlug,
                skipUrlSlug: undefined,
            });
            const { indexSegment } = context;
            records.push(
                compact({
                    type: "endpoint-v2",
                    objectID: uuid(),
                    endpoint: {
                        name: endpointDef.name,
                        description:
                            endpointDef.description != null
                                ? convertMarkdownToText(endpointDef.description)
                                : undefined,
                        method: endpointDef.method,
                        path: {
                            parts: endpointDef.path.parts,
                        },
                    },
                    path: {
                        parts: endpointContext.pathParts,
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
            );
        }
        // Add records for query parameters, request/response body etc.
        return records;
    }
}

// interface PathPart {
//     name: string;
//     urlSlug: string;
//     skipUrlSlug?: boolean;
// }

function getPathPartsBySubpackage({
    definition,
}: {
    definition: APIV1Db.DbApiDefinition;
}): Record<APIV1Read.SubpackageId, Algolia.AlgoliaRecordPathPart[]> {
    return getPathPartsBySubpackageHelper({
        definition,
        subpackages: getSubpackagesMap({ definition, subpackages: definition.rootPackage.subpackages }),
        pathParts: [],
    });
}

function getPathPartsBySubpackageHelper({
    definition,
    subpackages,
    pathParts,
}: {
    definition: APIV1Db.DbApiDefinition;
    subpackages: Record<APIV1Read.SubpackageId, APIV1Db.DbApiDefinitionSubpackage>;
    pathParts: Algolia.AlgoliaRecordPathPart[];
}): Record<APIV1Read.SubpackageId, Algolia.AlgoliaRecordPathPart[]> {
    let result: Record<APIV1Read.SubpackageId, Algolia.AlgoliaRecordPathPart[]> = {};
    for (const [id, subpackage] of Object.entries(subpackages)) {
        if (subpackage.pointsTo != null) {
            const pointedToSubpackage = definition.subpackages[subpackage.pointsTo];
            if (pointedToSubpackage == null) {
                LOGGER.error("Failed to find pointedTo subpackage for API. id=", id);
                continue;
            }
            result = {
                ...result,
                ...getPathPartsBySubpackageHelper({
                    definition,
                    subpackages: {
                        [subpackage.pointsTo]: {
                            ...pointedToSubpackage,
                            urlSlug: subpackage.urlSlug,
                            name: subpackage.name,
                        },
                    },
                    pathParts,
                }),
            };
        } else {
            const path: Algolia.AlgoliaRecordPathPart[] = [
                ...pathParts,
                {
                    name: subpackage.name,
                    urlSlug: subpackage.urlSlug,
                    skipUrlSlug: undefined,
                },
            ];
            result[APIV1Db.SubpackageId(id)] = path;
            result = {
                ...result,
                ...getPathPartsBySubpackageHelper({
                    definition,
                    subpackages: getSubpackagesMap({ definition, subpackages: subpackage.subpackages }),
                    pathParts: path,
                }),
            };
        }
    }
    return result;
}

function getSubpackagesMap({
    definition,
    subpackages,
}: {
    definition: APIV1Db.DbApiDefinition;
    subpackages: APIV1Read.SubpackageId[];
}): Record<APIV1Read.SubpackageId, APIV1Db.DbApiDefinitionSubpackage> {
    return Object.fromEntries(
        subpackages.map((id) => {
            const subpackage = definition.subpackages[id];
            if (subpackage == null) {
                LOGGER.error("Failed to find subpackage for API. id=", id);
                return [];
            }
            return [id, subpackage];
        }),
    );
}

interface Frontmatter {
    title?: string; // overrides sidebar title
}

export function getFrontmatter(content: string): {
    frontmatter: Frontmatter;
    content: string;
} {
    try {
        const gm = grayMatter(content);
        return { frontmatter: gm.data, content: gm.content };
    } catch (e) {
        return { frontmatter: {}, content };
    }
}
