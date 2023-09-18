import algolia, { type SearchClient } from "algoliasearch";
import type { FdrApplication } from "../../app";
import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";

type WithObjectId<T> = { objectID: string } & T;

export type AlgoliaSearchRecord = WithObjectId<FernRegistryDocsRead.AlgoliaRecord>;

export interface AlgoliaService {
    /**
     * Does not fail if the index does not exist.
     */
    deleteIndex(indexName: string): Promise<void>;
    /**
     * Does not fail if the index does not exist.
     */
    scheduleIndexDeletion(indexName: string): Promise<void>;

    /**
     * Does not fail if the index does not exist.
     */
    clearIndexRecords(indexName: string): Promise<void>;

    /**
     * Does not fail if the index does not exist.
     */
    saveIndexRecords(indexName: string, records: AlgoliaSearchRecord[]): Promise<void>;

    /**
     * Does not fail if the index does not exist.
     */
    saveIndexSettings(indexName: string): Promise<void>;

    generateSearchApiKey(filters: string): string;

    deleteIndexSegmentRecords(indexName: string, indexSegmentIds: string[]): Promise<void>;
}

type AttributeToSnippet = `${keyof AlgoliaSearchRecord}:${number}`;

export class AlgoliaServiceImpl implements AlgoliaService {
    private readonly client: SearchClient;

    private static readonly attributesToSnippet: AttributeToSnippet[] = ["title:20", "subtitle:20"];

    public constructor(private readonly app: FdrApplication) {
        const { config } = app;
        this.client = algolia(config.algoliaAppId, config.algoliaAdminApiKey);
    }

    public async deleteIndex(indexName: string) {
        await this.client.initIndex(indexName).delete().wait();
    }

    public async scheduleIndexDeletion(indexName: string) {
        await this.client.initIndex(indexName).delete();
    }

    public async clearIndexRecords(indexName: string) {
        await this.client.initIndex(indexName).clearObjects().wait();
    }

    public async saveIndexRecords(indexName: string, records: AlgoliaSearchRecord[]) {
        await this.client.initIndex(indexName).saveObjects(records).wait();
    }

    public async saveIndexSettings(indexName: string) {
        await this.client.initIndex(indexName).setSettings({
            attributesToSnippet: AlgoliaServiceImpl.attributesToSnippet,
        });
    }

    public generateSearchApiKey(filters: string) {
        return this.client.generateSecuredApiKey(this.app.config.algoliaAdminApiKey, {
            filters,
        });
    }

    public async deleteIndexSegmentRecords(indexName: string, indexSegmentIds: string[]) {
        const filters = indexSegmentIds.map((indexSegmentId) => `indexSegmentId:${indexSegmentId}`).join(" OR ");
        await this.client.initIndex(indexName).deleteBy({ filters }).wait();
    }
}
