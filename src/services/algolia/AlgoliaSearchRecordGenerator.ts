import { v4 as uuid } from "uuid";
import type { FernRegistry } from "../../generated";
import * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import { convertMarkdownToText } from "../../util";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../../util/fern/db";
import { getSubpackageParentSlugs } from "../../util/fern/db/subpackage";
import { type AlgoliaSearchRecord } from "./AlgoliaService";

type ApiDefinitionLoader = (apiDefinitionId: string) => Promise<FernRegistry.api.v1.db.DbApiDefinition | null>;

class NavigationContext {
    #slugs: string[];

    /**
     * The path represented by context slugs.
     */
    public get path() {
        return this.#slugs.join("/");
    }

    public constructor(slugs: string[] = []) {
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
        return new NavigationContext([...this.#slugs, ...slugs]);
    }
}

interface AlgoliaSearchRecordGeneratorConfig {
    docsDefinition: FernRegistry.docs.v1.db.DocsDefinitionDb.V2;
    loadApiDefinition: ApiDefinitionLoader;
}

export class AlgoliaSearchRecordGenerator {
    private get docsDefinition() {
        return this.config.docsDefinition;
    }

    public constructor(private readonly config: AlgoliaSearchRecordGeneratorConfig) {}

    public async generateAlgoliaSearchRecordsForDocs() {
        const navigationConfig = this.docsDefinition.config.navigation;
        const context = new NavigationContext();
        if (isVersionedNavigationConfig(navigationConfig)) {
            // TODO: Index all versions (FER-118)
            const [firstVersion] = navigationConfig.versions;
            if (firstVersion == null) {
                return [];
            }
            return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
                firstVersion.config,
                context.withSlug(firstVersion.version)
            );
        }
        return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(navigationConfig, context);
    }

    private async generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
        config: FernRegistryDocsDb.UnversionedNavigationConfig,
        context: NavigationContext
    ) {
        return isUnversionedTabbedNavigationConfig(config)
            ? this.generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(config, context)
            : this.generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(config, context);
    }

    private async generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(
        config: FernRegistryDocsDb.UnversionedUntabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = await Promise.all(
            config.items.map((item) => this.generateAlgoliaSearchRecordsForNavigationItem(item, context))
        );
        return records.flat(1);
    }

    private async generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
        config: FernRegistryDocsDb.UnversionedTabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = await Promise.all(
            config.tabs.map(async (tab) => {
                const tabRecords = await Promise.all(
                    tab.items.map((item) =>
                        this.generateAlgoliaSearchRecordsForNavigationItem(item, context.withSlug(tab.urlSlug))
                    )
                );
                return tabRecords.flat(1);
            })
        );
        return records.flat(1);
    }

    private async generateAlgoliaSearchRecordsForNavigationItem(
        item: FernRegistryDocsDb.NavigationItem,
        context: NavigationContext
    ): Promise<AlgoliaSearchRecord[]> {
        if (item.type === "section") {
            const section = item;
            const records = await Promise.all(
                section.items.map((item) =>
                    this.generateAlgoliaSearchRecordsForNavigationItem(
                        item,
                        section.skipUrlSlug ? context : context.withSlug(section.urlSlug)
                    )
                )
            );
            return records.flat(1);
        } else if (item.type === "api") {
            const api = item;
            const apiId = api.api;
            const apiDef = await this.config.loadApiDefinition(apiId);
            if (apiDef == null) {
                return [];
            }
            return this.generateAlgoliaSearchRecordsForApiDefinition(
                apiDef,
                api.skipUrlSlug ? context : context.withSlug(api.urlSlug)
            );
        } else {
            const page = item;
            const pageContent = this.docsDefinition.pages[page.id];
            if (pageContent == null) {
                return [];
            }
            const { path } = context.withSlug(page.urlSlug);
            const processedContent = convertMarkdownToText(pageContent.markdown);
            return [
                {
                    objectID: uuid(),
                    type: "page",
                    path,
                    title: page.title,
                    subtitle: processedContent,
                },
            ];
        }
    }

    private generateAlgoliaSearchRecordsForApiDefinition(
        apiDef: FernRegistry.api.v1.db.DbApiDefinition,
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
        endpointDef: FernRegistry.api.v1.db.DbEndpointDefinition,
        context: NavigationContext
    ): AlgoliaSearchRecord[] {
        const records: AlgoliaSearchRecord[] = [];
        if (endpointDef.name || endpointDef.description) {
            const { path } = context.withSlug(endpointDef.urlSlug);
            const processedDescription = endpointDef.description ? convertMarkdownToText(endpointDef.description) : "";
            records.push({
                objectID: uuid(),
                type: "endpoint",
                title: endpointDef.name ?? "",
                subtitle: processedDescription,
                path,
            });
        }
        // Add records for query parameters, request/response body etc.
        return records;
    }
}
