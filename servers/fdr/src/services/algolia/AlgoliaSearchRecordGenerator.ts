import { DocsV1Read, visitDbNavigationTab, visitUnversionedDbNavigationConfig } from "@fern-api/fdr-sdk";
import { v4 as uuid } from "uuid";
import { APIV1Db, APIV1Read, DocsV1Db } from "../../api";
import { LOGGER } from "../../app/FdrApplication";
import { assertNever, convertMarkdownToText, truncateToBytes } from "../../util";
import { compact } from "../../util/object";
import type { AlgoliaSearchRecord, IndexSegment } from "./types";

class NavigationContext {
    #indexSegment: IndexSegment;
    #pathParts: PathPart[];

    /**
     * The path represented by context slugs.
     */
    public get path() {
        return this.#pathParts
            .filter((p) => p.skipUrlSlug == null || !p.skipUrlSlug)
            .map((p) => p.urlSlug)
            .join("/");
    }

    /**
     * The path represented by context slugs.
     */
    public get pathParts() {
        return [...this.#pathParts];
    }

    public constructor(
        public readonly indexSegment: IndexSegment,
        pathParts: PathPart[],
    ) {
        this.#indexSegment = indexSegment;
        this.#pathParts = pathParts;
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withPathPart(pathPart: PathPart) {
        return this.withPathParts([pathPart]);
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withPathParts(pathParts: PathPart[]) {
        return new NavigationContext(this.#indexSegment, [...this.#pathParts, ...pathParts]);
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withFullSlug(fullSlug: string[]) {
        return new NavigationContext(
            this.#indexSegment,
            fullSlug.map((urlSlug) => ({ name: urlSlug, urlSlug })),
        );
    }
}

interface AlgoliaSearchRecordGeneratorConfig {
    docsDefinition: DocsV1Db.DocsDefinitionDb;
    apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>;
}

export class AlgoliaSearchRecordGenerator {
    public constructor(private readonly config: AlgoliaSearchRecordGeneratorConfig) {}

    public generateAlgoliaSearchRecordsForSpecificDocsVersion(
        navigationConfig: DocsV1Db.UnversionedNavigationConfig,
        indexSegment: IndexSegment,
    ): AlgoliaSearchRecord[] {
        const context = new NavigationContext(indexSegment, []);
        return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(navigationConfig, context);
    }

    private generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
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

    private generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(
        config: DocsV1Db.UnversionedUntabbedNavigationConfig,
        context: NavigationContext,
    ) {
        const records = config.items.map((item) => this.generateAlgoliaSearchRecordsForNavigationItem(item, context));
        return records.flat(1);
    }

    private generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
        config: DocsV1Db.UnversionedTabbedNavigationConfig,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records =
            config.tabsV2?.flatMap((tab) => {
                switch (tab.type) {
                    case "group":
                        return tab.items.flatMap((item) =>
                            this.generateAlgoliaSearchRecordsForNavigationItem(item, context),
                        );
                    case "changelog":
                        return this.generateAlgoliaSearchRecordsForChangelogSection(tab, context);
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
                                context.withPathPart({ name: tab.title, urlSlug: group.urlSlug }),
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

    private generateAlgoliaSearchRecordsForNavigationItem(
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
            const apiDef = this.config.apiDefinitionsById.get(apiId);
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
        }
        assertNever(item);
    }

    private generateAlgoliaSearchRecordsForChangelogSection(
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
                    urlSlug, // changelogs are all under the same page
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

    private generateAlgoliaSearchRecordsForApiDefinition(
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
            const pathParts = subpackagePathParts[id];
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

    private generateAlgoliaSearchRecordsForEndpointDefinition(
        endpointDef: APIV1Db.DbEndpointDefinition,
        context: NavigationContext,
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];
        if (endpointDef.name != null || endpointDef.description != null) {
            const endpointContext = context.withPathPart({
                name: endpointDef.name ?? "",
                urlSlug: endpointDef.urlSlug,
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

interface PathPart {
    name: string;
    urlSlug: string;
    skipUrlSlug?: boolean;
}

function getPathPartsBySubpackage({
    definition,
}: {
    definition: APIV1Db.DbApiDefinition;
}): Record<APIV1Read.SubpackageId, PathPart[]> {
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
    pathParts: PathPart[];
}): Record<APIV1Read.SubpackageId, PathPart[]> {
    let result: Record<APIV1Read.SubpackageId, PathPart[]> = {};
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
            const path: PathPart[] = [...pathParts, { name: subpackage.name, urlSlug: subpackage.urlSlug }];
            result[id] = path;
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
