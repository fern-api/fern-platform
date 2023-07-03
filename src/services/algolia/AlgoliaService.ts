import algolia, { type SearchClient } from "algoliasearch";
import type { FdrApplication } from "../../app";
import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";

type WithObjectId<T> = { objectID: string } & T;

export type AlgoliaSearchRecord = WithObjectId<FernRegistryDocsRead.AlgoliaRecord>;

export interface AlgoliaService {
    clearIndexRecords(indexName: string): Promise<void>;

    saveIndexRecords(indexName: string, records: AlgoliaSearchRecord[]): Promise<void>;
}

export class AlgoliaServiceImpl implements AlgoliaService {
    private readonly client: SearchClient;

    public constructor(app: FdrApplication) {
        const { config } = app;
        this.client = algolia(config.algoliaAppId, config.algoliaAdminApiKey);
    }

    public async clearIndexRecords(indexName: string) {
        await this.client.initIndex(indexName).clearObjects().wait();
    }

    public async saveIndexRecords(indexName: string, records: AlgoliaSearchRecord[]) {
        await this.client.initIndex(indexName).saveObjects(records).wait();
    }
}
