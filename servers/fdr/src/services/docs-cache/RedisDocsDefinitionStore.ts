import { createClient, RedisClientType } from "redis";
import { CachedDocsResponse } from "./DocsCacheInterface";

export default class RedisDocsDefinitionStore {
    private client: RedisClientType;

    public constructor(cacheEndpointUrl: string) {
        this.client = createClient({ url: cacheEndpointUrl, pingInterval: 10000 });
    }

    public initializeCache() {
        this.client.on("connect", () => {
            console.log("Connected!");
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
