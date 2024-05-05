import { createCluster, RedisClientType, RedisClusterType } from "redis";
import { LOGGER } from "../../app/FdrApplication";
import { CachedDocsResponse } from "./DocsDefinitionCache";

export default class RedisDocsDefinitionStore {
    private client: RedisClusterType | RedisClientType;

    public constructor(cacheEndpointUrl: string) {
        this.client = createCluster({
            rootNodes: [
                {
                    url: cacheEndpointUrl,
                },
            ],
            defaults: {
                pingInterval: 10000,
            },
        });
        // this.client = createClient({ url: cacheEndpointUrl, pingInterval: 10000 });
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

    public async set({ url, value }: { url: URL; value: CachedDocsResponse }): Promise<void> {
        await this.client.set(url.hostname, JSON.stringify(value));
    }
}
