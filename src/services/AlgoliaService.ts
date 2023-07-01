import algolia, { type SearchClient } from "algoliasearch";
import type { FdrApplication } from "../app";

// TODO: Generate this with Fern and share it with the frontend project
export interface AlgoliaRecord {
    objectID: string;
    type: "page" | "endpoint";
    title: string;
    subtitle: string;
    path: string;
}

export interface AlgoliaService {
    deleteIndex(indexName: string): Promise<void>;

    indexRecords(indexName: string, records: AlgoliaRecord[]): Promise<void>;
}

export class AlgoliaServiceImpl implements AlgoliaService {
    private readonly client: SearchClient;

    public constructor(app: FdrApplication) {
        const { config } = app;
        this.client = algolia(config.algoliaAppId, config.algoliaAdminApiKey);
    }

    public async deleteIndex(indexName: string) {
        await this.client.initIndex(indexName).delete();
    }

    public async indexRecords(indexName: string, records: AlgoliaRecord[]) {
        await this.client.initIndex(indexName).saveObjects(records).wait();
    }
}
