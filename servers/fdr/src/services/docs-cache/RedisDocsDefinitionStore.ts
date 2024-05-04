import { createClient, RedisClientType } from "redis";
import { CachedDocsResponse } from "./DocsDefinitionCache";

export default class RedisDocsDefinitionStore {
    private client: RedisClientType;

    public constructor(cacheEndpointUrl: string) {
        this.client = createClient({ url: cacheEndpointUrl, pingInterval: 10000 });
    }

    public initializeCache() {
        this.client.on("error", (err) => {
            console.info(`Supressed Redis client error: ${err}`);
        });
        this.client.connect().catch(console.error);
    }

    public async get({ url }: { url: URL }): Promise<CachedDocsResponse | null> {
        const result = await this.client.get(url.hostname);
        if (result) {
            return JSON.parse(result);
        }
        return null;
    }

    public set({ url, value }: { url: URL; value: CachedDocsResponse }): void {
        this.client.set(url.hostname, JSON.stringify(value));
    }
}
