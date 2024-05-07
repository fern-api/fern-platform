import { RedisClientType, RedisClusterType, createClient, createCluster } from "redis";
import { LOGGER } from "../../app/FdrApplication";
import { CachedDocsResponse } from "./DocsDefinitionCache";

export declare namespace RedisDocsDefinitionStore {
    interface Args {
        clusterModeEnabled: boolean;
        cacheEndpointUrl: string;
    }
}

export default class RedisDocsDefinitionStore {
    private client: RedisClusterType | RedisClientType;

    public constructor({ cacheEndpointUrl, clusterModeEnabled }: RedisDocsDefinitionStore.Args) {
        this.client = clusterModeEnabled
            ? createCluster({
                  rootNodes: [
                      {
                          url: cacheEndpointUrl,
                      },
                  ],
                  defaults: {
                      pingInterval: 10000,
                  },
              })
            : createClient({ url: cacheEndpointUrl, pingInterval: 10000 });
        this.client.on("error", (error) => LOGGER.error("Encountered error from redis", error));
    }

    public async initializeCache(): Promise<void> {
        await this.client.connect();
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
