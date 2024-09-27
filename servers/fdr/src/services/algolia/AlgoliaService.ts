import { APIV1Db, DocsV1Db } from "@fern-api/fdr-sdk";
import algolia, { type SearchClient } from "algoliasearch";
import type { FdrApplication } from "../../app";
import { AlgoliaSearchRecordGeneratorV2 } from "./AlgoliaSearchRecordGeneratorV2";
import type { AlgoliaSearchRecord, ConfigSegmentTuple } from "./types";

export interface AlgoliaService {
    deleteIndexSegmentRecords(indexSegmentIds: string[]): Promise<void>;

    generateSearchRecords(params: {
        docsDefinition: DocsV1Db.DocsDefinitionDb;
        apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>;
        configSegmentTuples: ConfigSegmentTuple[];
    }): Promise<AlgoliaSearchRecord[]>;

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

    public async generateSearchRecords({
        docsDefinition,
        apiDefinitionsById,
        configSegmentTuples,
    }: {
        docsDefinition: DocsV1Db.DocsDefinitionDb;
        apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>;
        configSegmentTuples: ConfigSegmentTuple[];
    }) {
        return configSegmentTuples.flatMap(([config, indexSegment]) => {
            const generator = new AlgoliaSearchRecordGeneratorV2({ docsDefinition, apiDefinitionsById });
            return generator.generateAlgoliaSearchRecordsForSpecificDocsVersion(config, indexSegment);
        });
    }

    public generateSearchApiKey(filters: string, validUntil: Date) {
        return this.client.generateSecuredApiKey(this.baseSearchApiKey, {
            filters,
            validUntil: Math.floor(validUntil.getTime() / 1_000),
        });
    }

    public async deleteIndexSegmentRecords(indexSegmentIds: string[]) {
        const filters = indexSegmentIds.map((indexSegmentId) => `indexSegmentId:${indexSegmentId}`).join(" OR ");
        await this.index.deleteBy({ filters }).wait();
    }
}
