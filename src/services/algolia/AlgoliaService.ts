import algolia, { type SearchClient } from "algoliasearch";
import type { FdrApplication } from "../../app";
import type { FernRegistry } from "../../generated";
import type * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import { AlgoliaSearchRecordGenerator } from "./AlgoliaSearchRecordGenerator";
import type { AlgoliaSearchRecord, ConfigSegmentTuple } from "./types";

export interface AlgoliaService {
    deleteIndexSegmentRecords(indexSegmentIds: string[]): Promise<void>;

    generateSearchRecords(
        docsDefinition: FernRegistryDocsDb.DocsDefinitionDb,
        configSegmentTuples: ConfigSegmentTuple[]
    ): Promise<AlgoliaSearchRecord[]>;

    uploadSearchRecords(records: AlgoliaSearchRecord[]): Promise<void>;

    generateSearchApiKey(filters: string, validUntil: Date): string;
}

export class AlgoliaServiceImpl implements AlgoliaService {
    private readonly client: SearchClient;

    private get baseSearchApiKey() {
        return this.app.config.algoliaSearchApiKey;
    }

    private get index() {
        return this.client.initIndex(this.app.config.algoliaSearchIndex);
    }

    public constructor(private readonly app: FdrApplication) {
        const { config } = app;
        this.client = algolia(config.algoliaAppId, config.algoliaAdminApiKey);
    }

    public async uploadSearchRecords(records: AlgoliaSearchRecord[]) {
        await this.index.saveObjects(records).wait();
    }

    public async generateSearchRecords(
        docsDefinition: FernRegistryDocsDb.DocsDefinitionDb,
        configSegmentTuples: ConfigSegmentTuple[]
    ) {
        const preloadApiDefinitions = async () => {
            const apiIdDefinitionTuples = await Promise.all(
                docsDefinition.referencedApis.map(
                    async (id) => [id, await this.app.services.db.getApiDefinition(id)] as const
                )
            );
            return new Map(apiIdDefinitionTuples) as Map<string, FernRegistry.api.v1.db.DbApiDefinition>;
        };
        const apiDefinitionsById = await preloadApiDefinitions();
        return configSegmentTuples.flatMap(([config, indexSegment]) => {
            const generator = new AlgoliaSearchRecordGenerator({ docsDefinition, apiDefinitionsById });
            return generator.generateAlgoliaSearchRecordsForSpecificDocsVersion(config, indexSegment);
        });
    }

    public generateSearchApiKey(filters: string, validUntil: Date) {
        return this.client.generateSecuredApiKey(this.baseSearchApiKey, {
            filters,
            validUntil: validUntil.getTime() / 1_000,
        });
    }

    public async deleteIndexSegmentRecords(indexSegmentIds: string[]) {
        const filters = indexSegmentIds.map((indexSegmentId) => `indexSegmentId:${indexSegmentId}`).join(" OR ");
        await this.index.deleteBy({ filters }).wait();
    }
}
