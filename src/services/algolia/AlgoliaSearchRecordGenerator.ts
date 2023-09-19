import { v4 as uuid } from "uuid";
import { APIV1Db, DocsV1Db } from "../../api";
import { convertMarkdownToText, truncateToBytes } from "../../util";
import { isUnversionedTabbedNavigationConfig } from "../../util/fern/db";
import { getSubpackageParentSlugs } from "../../util/fern/db/subpackage";
import type { AlgoliaSearchRecord, IndexSegment } from "./types";

class NavigationContext {
    #slugs: string[];
    #indexSegment: IndexSegment;

    /**
     * The path represented by context slugs.
     */
    public get path() {
        return this.#slugs.join("/");
    }

    public constructor(public readonly indexSegment: IndexSegment, slugs: string[]) {
        this.#indexSegment = indexSegment;
        this.#slugs = slugs;
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withSlug(slug: string) {
        return this.withSlugs([slug]);
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withSlugs(slugs: string[]) {
        return new NavigationContext(this.#indexSegment, [...this.#slugs, ...slugs]);
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
                this.generateAlgoliaSearchRecordsForNavigationItem(item, context.withSlug(tab.urlSlug))
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
                    section.skipUrlSlug ? context : context.withSlug(section.urlSlug)
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
                api.skipUrlSlug ? context : context.withSlug(api.urlSlug)
            );
        } else {
            const page = item;
            const pageContent = this.config.docsDefinition.pages[page.id];
            if (pageContent == null) {
                return [];
            }
            const { path } = context.withSlug(page.urlSlug);
            const processedContent = convertMarkdownToText(pageContent.markdown);
            const { indexSegment } = context;
            return [
                {
                    objectID: uuid(),
                    type: "page",
                    path,
                    title: page.title,
                    // TODO: Set to something more than 10kb on prod
                    // See: https://support.algolia.com/hc/en-us/articles/4406981897617-Is-there-a-size-limit-for-my-index-records-/
                    subtitle: truncateToBytes(processedContent, 10_000 - 1),
                    indexSegmentId: indexSegment.id,
                    ...(indexSegment.type === "versioned"
                        ? {
                              version: indexSegment.version.id,
                              versionSlug: indexSegment.version.urlSlug ?? indexSegment.version.id,
                          }
                        : {}),
                },
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
            const parentSlugs = parent != null ? getSubpackageParentSlugs(subpackage, apiDef) : [];
            subpackage.endpoints.forEach((e) => {
                const endpointRecords = this.generateAlgoliaSearchRecordsForEndpointDefinition(
                    e,
                    context.withSlugs([...parentSlugs, subpackage.urlSlug])
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
            const { path } = context.withSlug(endpointDef.urlSlug);
            const processedDescription = endpointDef.description ? convertMarkdownToText(endpointDef.description) : "";
            const { indexSegment } = context;
            records.push({
                objectID: uuid(),
                type: "endpoint",
                title: endpointDef.name ?? "",
                subtitle: processedDescription,
                path,
                indexSegmentId: indexSegment.id,
                ...(indexSegment.type === "versioned"
                    ? {
                          version: indexSegment.version.id,
                          versionSlug: indexSegment.version.urlSlug ?? indexSegment.version.id,
                      }
                    : {}),
            });
        }
        // Add records for query parameters, request/response body etc.
        return records;
    }
}
