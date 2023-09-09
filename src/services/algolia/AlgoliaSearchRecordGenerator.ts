import { v4 as uuid } from "uuid";
import type { FernRegistry } from "../../generated";
import { convertMarkdownToText } from "../../util";
import { getSubpackageParentSlugs } from "../../util/fern/db/subpackage";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../../util/fern/read";
import { type AlgoliaSearchRecord } from "./AlgoliaService";

type ApiDefinitionLoader = (apiDefinitionId: string) => Promise<FernRegistry.api.v1.db.DbApiDefinition | null>;

class NavigationContext {
    #slugs: string[];
    #records: AlgoliaSearchRecord[];

    public get records() {
        return [...this.#records];
    }

    /**
     * The path represented by context slugs.
     */
    public get path() {
        return this.#slugs.join("/");
    }

    public constructor(slugs: string[] = [], records: AlgoliaSearchRecord[] = []) {
        this.#slugs = slugs;
        this.#records = records;
    }

    public clone() {
        return new NavigationContext([...this.#slugs], [...this.#records]);
    }

    public addSlug(slug: string) {
        this.#slugs.push(slug);
    }

    public addRecord(record: AlgoliaSearchRecord) {
        this.addRecords([record]);
    }

    public addRecords(records: AlgoliaSearchRecord[]) {
        this.#records.push(...records);
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
        return new NavigationContext([...this.#slugs, ...slugs], [...this.#records]);
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
            context.addSlug(firstVersion.version);
            return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(firstVersion.config, context);
        }
        return this.generateAlgoliaSearchRecordsForUnversionedNavigationConfig(navigationConfig, context);
    }

    private async generateAlgoliaSearchRecordsForUnversionedNavigationConfig(
        config: FernRegistry.docs.v1.read.UnversionedNavigationConfig,
        context: NavigationContext
    ) {
        return isUnversionedTabbedNavigationConfig(config)
            ? this.generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(config, context)
            : this.generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(config, context);
    }

    private async generateAlgoliaSearchRecordsForUnversionedUntabbedNavigationConfig(
        config: FernRegistry.docs.v1.read.UnversionedUntabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = await Promise.all(
            config.items.map((item) => this.generateAlgoliaSearchRecordsForNavigationItem(item, context.clone()))
        );
        return records.flat(1);
    }

    private async generateAlgoliaSearchRecordsForUnversionedTabbedNavigationConfig(
        config: FernRegistry.docs.v1.read.UnversionedTabbedNavigationConfig,
        context: NavigationContext
    ) {
        const records = await Promise.all(
            config.tabs.map(async (tab) => {
                const tabRecords = await Promise.all(
                    tab.items.map((item) =>
                        this.generateAlgoliaSearchRecordsForNavigationItem(
                            item,
                            context.clone() // TODO: Initialize with tab slug if needed
                        )
                    )
                );
                return tabRecords.flat(1);
            })
        );
        return records.flat(1);
    }

    private async generateAlgoliaSearchRecordsForNavigationItem(
        item: FernRegistry.docs.v1.read.NavigationItem,
        context: NavigationContext
    ) {
        if (item.type === "section") {
            const section = item;
            await Promise.all(
                section.items.map(async (item) => {
                    return await this.generateAlgoliaSearchRecordsForNavigationItem(
                        item,
                        context.withSlug(section.urlSlug)
                    );
                })
            );
        } else if (item.type === "api") {
            const api = item;
            const apiId = api.api;
            const apiDef = await this.config.loadApiDefinition(apiId);
            if (apiDef) {
                const apiRecords = this.generateAlgoliaSearchRecordsForApiDefinition(
                    apiDef,
                    context.withSlug(api.urlSlug)
                );
                context.addRecords(apiRecords);
            }
        } else {
            const page = item;
            const pageContent = this.docsDefinition.pages[page.id];
            if (pageContent) {
                const { path } = context.withSlug(page.urlSlug);
                const processedContent = convertMarkdownToText(pageContent.markdown);
                context.addRecord({
                    objectID: uuid(),
                    type: "page",
                    path,
                    title: page.title,
                    subtitle: processedContent,
                });
            }
        }
        return context.records;
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
