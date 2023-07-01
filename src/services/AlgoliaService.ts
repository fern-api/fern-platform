import algolia, { type SearchClient } from "algoliasearch";
import { v4 as uuid } from "uuid";
import type { FdrApplication } from "../app";
import type { FernRegistry } from "../generated";
import { type WithoutQuestionMarks } from "../util";

// TODO: Generate this with Fern and share it with the frontend project
interface AlgoliaRecord {
    objectID: string;
    type: "page" | "endpoint";
    title: string;
    subtitle: string;
    path: string;
}

type ApiDefinitionLoader = (apiDefinitionId: string) => Promise<FernRegistry.api.v1.db.DbApiDefinition | null>;

export interface AlgoliaService {
    buildRecordsForDocs(
        docsDefinition: WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2>,
        loadApiDefinition: ApiDefinitionLoader
    ): Promise<AlgoliaRecord[]>;

    deleteIndex(indexName: string): Promise<void>;

    indexRecords(indexName: string, records: AlgoliaRecord[]): Promise<void>;
}

export class AlgoliaServiceImpl implements AlgoliaService {
    private readonly client: SearchClient;

    public constructor(app: FdrApplication) {
        const { config } = app;
        this.client = algolia(config.algoliaAppId, config.algoliaAdminApiKey);
    }

    public async buildRecordsForDocs(
        docsDefinition: WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2>,
        loadApiDefinition: (apiDefinitionId: string) => Promise<FernRegistry.api.v1.db.DbApiDefinition | null>
    ) {
        const records = await Promise.all(
            docsDefinition.config.navigation.items.map((item) =>
                this.buildRecordsForNavigationItem(docsDefinition, loadApiDefinition, [], [], item)
            )
        );
        return records.flat(1);
    }

    private async buildRecordsForNavigationItem(
        docsDefinition: WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2>,
        loadApiDefinition: ApiDefinitionLoader,
        cumulativeSlugs: string[],
        cumulativeRecords: AlgoliaRecord[],
        item: FernRegistry.docs.v1.read.NavigationItem
    ) {
        if (item.type === "section") {
            const section = item;
            await Promise.all(
                section.items.map(async (item) => {
                    return await this.buildRecordsForNavigationItem(
                        docsDefinition,
                        loadApiDefinition,
                        [...cumulativeSlugs, section.urlSlug],
                        cumulativeRecords,
                        item
                    );
                })
            );
        } else if (item.type === "api") {
            const api = item;
            const apiId = api.api;
            const apiDef = await loadApiDefinition(apiId);
            if (apiDef) {
                const apiRecords = this.buildRecordsForApiDefinition([...cumulativeSlugs, item.urlSlug], apiDef);
                cumulativeRecords.push(...apiRecords);
            }
        } else {
            const page = item;
            const pageContent = docsDefinition.pages[page.id];
            if (pageContent) {
                const path = [...cumulativeSlugs, page.urlSlug].join("/");
                cumulativeRecords.push({
                    objectID: uuid(),
                    type: "page",
                    path,
                    title: page.title,
                    subtitle: pageContent.markdown,
                });
            }
        }
        return cumulativeRecords;
    }

    private buildRecordsForApiDefinition(
        cumulativeSlugs: string[],
        apiDef: FernRegistry.api.v1.db.DbApiDefinition
    ): AlgoliaRecord[] {
        const apiUrlSlug = cumulativeSlugs.join("/");
        const { subpackages } = apiDef;
        const records: AlgoliaRecord[] = [];
        Object.values(subpackages).forEach((subpackage) => {
            subpackage.endpoints.forEach((endpoint) => {
                if (endpoint.name || endpoint.description) {
                    const path = [apiUrlSlug, subpackage.urlSlug, endpoint.urlSlug].join("/");
                    records.push({
                        objectID: uuid(),
                        type: "endpoint",
                        title: endpoint.name ?? "",
                        subtitle: endpoint.description ?? "",
                        path,
                    });
                }
            });
        });
        return records;
    }

    public async deleteIndex(indexName: string) {
        await this.client.initIndex(indexName).delete();
    }

    public async indexRecords(indexName: string, records: AlgoliaRecord[]) {
        await this.client.initIndex(indexName).saveObjects(records).wait();
    }
}
