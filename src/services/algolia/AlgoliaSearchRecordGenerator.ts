import { v4 as uuid } from "uuid";
import { APIV1Db, DocsV1Db } from "../../api";
import { convertMarkdownToText, truncateToBytes } from "../../util";
import { isUnversionedTabbedNavigationConfig } from "../../util/fern/db";
import { getSubpackageParentPathParts, type PathPart } from "../../util/fern/db/subpackage";
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
            .filter((p) => !p.skipUrlSlug)
            .map((p) => p.urlSlug)
            .join("/");
    }

    /**
     * The path represented by context slugs.
     */
    public get pathParts() {
        return [...this.#pathParts];
    }

    public constructor(public readonly indexSegment: IndexSegment, pathParts: PathPart[]) {
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
}

interface AlgoliaSearchRecordGeneratorConfig {
    docsDefinition: DocsV1Db.DocsDefinitionDb;
    apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>;
}

export class AlgoliaSearchRecordGenerator {
    public constructor(private readonly config: AlgoliaSearchRecordGeneratorConfig) {}

    public generateAlgoliaSearchRecordsForSpecificDocsVersion(
        navigationConfig: DocsV1Db.UnversionedNavigationConfig,
        indexSegment: IndexSegment
    ): AlgoliaSearchRecord[] {
        const context = new NavigationContext(indexSegment, []);
        return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(navigationConfig, context);
    }

    private generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
        config: DocsV1Db.UnversionedNavigationConfig,
        context: NavigationContext
    ) {
        return isUnversionedTabbedNavigationConfig(config)
            ? this.generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(config, context)
            : this.generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(config, context);
    }

    private generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(
        config: DocsV1Db.UnversionedUntabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = config.items.map((item) => this.generateAlgoliaSearchRecordsForNavigationItem(item, context));
        return records.flat(1);
    }

    private generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
        config: DocsV1Db.UnversionedTabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = config.tabs.map((tab) => {
            const tabRecords = tab.items.map((item) =>
                this.generateAlgoliaSearchRecordsForNavigationItem(
                    item,
                    context.withPathPart({ name: tab.title, urlSlug: tab.urlSlug })
                )
            );
            return tabRecords.flat(1);
        });
        return records.flat(1);
    }

    private generateAlgoliaSearchRecordsForNavigationItem(
        item: DocsV1Db.NavigationItem,
        context: NavigationContext
    ): AlgoliaSearchRecord[] {
        if (item.type === "section") {
            const section = item;
            const records = section.items.map((item) =>
                this.generateAlgoliaSearchRecordsForNavigationItem(
                    item,
                    context.withPathPart(
                        compact({
                            name: section.title,
                            urlSlug: section.urlSlug,
                            skipUrlSlug: section.skipUrlSlug || undefined,
                        })
                    )
                )
            );
            return records.flat(1);
        } else if (item.type === "api") {
            const api = item;
            const apiId = api.api;
            const apiDef = this.config.apiDefinitionsById.get(apiId);
            if (apiDef == null) {
                return [];
            }
            return this.generateAlgoliaSearchRecordsForApiDefinition(
                apiDef,
                context.withPathPart(
                    compact({
                        name: api.title,
                        urlSlug: api.urlSlug,
                        skipUrlSlug: api.skipUrlSlug || undefined,
                    })
                )
            );
        } else {
            const page = item;
            const pageContent = this.config.docsDefinition.pages[page.id];
            if (pageContent == null) {
                return [];
            }
            const pageContext = context.withPathPart({ name: page.title, urlSlug: page.urlSlug });
            const processedContent = convertMarkdownToText(pageContent.markdown);
            const { indexSegment } = context;
            return [
                compact({
                    type: "page-v2",
                    objectID: uuid(),
                    title: page.title,
                    // TODO: Set to something more than 10kb on prod
                    // See: https://support.algolia.com/hc/en-us/articles/4406981897617-Is-there-a-size-limit-for-my-index-records-/
                    content: truncateToBytes(processedContent, 10_000 - 1),
                    path: {
                        parts: pageContext.pathParts,
                    },
                    version: indexSegment.type === "versioned" ? indexSegment.version : undefined,
                    indexSegmentId: indexSegment.id,
                }),
            ];
        }
    }

    private generateAlgoliaSearchRecordsForApiDefinition(
        apiDef: APIV1Db.DbApiDefinition,
        context: NavigationContext
    ): AlgoliaSearchRecord[] {
        const { rootPackage, subpackages } = apiDef;
        const records: AlgoliaSearchRecord[] = [];

        rootPackage.endpoints.forEach((e) => {
            const endpointRecords = this.generateAlgoliaSearchRecordsForEndpointDefinition(e, context);
            records.push(...endpointRecords);
        });

        Object.values(subpackages).forEach((subpackage) => {
            const { parent } = subpackage;
            const parentPathParts = parent != null ? getSubpackageParentPathParts(subpackage, apiDef) : [];
            subpackage.endpoints.forEach((e) => {
                const endpointRecords = this.generateAlgoliaSearchRecordsForEndpointDefinition(
                    e,
                    context.withPathParts([...parentPathParts, { name: subpackage.name, urlSlug: subpackage.urlSlug }])
                );
                records.push(...endpointRecords);
            });
        });

        return records;
    }

    private generateAlgoliaSearchRecordsForEndpointDefinition(
        endpointDef: APIV1Db.DbEndpointDefinition,
        context: NavigationContext
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];
        if (endpointDef.name || endpointDef.description) {
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
                    version: indexSegment.type === "versioned" ? indexSegment.version : undefined,
                    indexSegmentId: indexSegment.id,
                })
            );
        }
        // Add records for query parameters, request/response body etc.
        return records;
    }
}
