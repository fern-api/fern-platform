import { createClient, RedisClientType } from "redis";
import { LOGGER } from "../../app/FdrApplication";
import { CachedDocsResponse } from "./DocsDefinitionCache";

export default class RedisDocsDefinitionStore {
    private client: RedisClientType;

    public constructor(cacheEndpointUrl: string) {
        this.client = createClient({ url: cacheEndpointUrl, pingInterval: 10000 });
    }

    public async initializeCache(): Promise<void> {
        this.client.on("error", (err) => {
            LOGGER.error(`Supressed Redis client error: ${err}`);
        });
        try {
            await this.client.connect();
        } catch (err) {
            LOGGER.error(`Supressed Redis client error: ${err}`);
        }
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
