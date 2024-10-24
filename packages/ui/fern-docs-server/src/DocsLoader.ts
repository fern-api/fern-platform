import { FdrAPI, FdrClient } from "@fern-api/fdr-sdk";
import { DocsDomainKVCache } from "./DocsKVCache";

export class DocsLoader {
    public static create(domain: string): DocsLoader {
        return new DocsLoader(domain);
    }

    private environment: string | undefined;
    public withEnvironment = (environment: string | undefined): DocsLoader => {
        this.environment = environment;
        return this;
    };

    private domain: string;
    private cache: DocsDomainKVCache;
    private constructor(xFernHost: string) {
        this.domain = xFernHost;
        this.cache = DocsDomainKVCache.getInstance(xFernHost);
    }

    public getOrgId = async (): Promise<string | undefined> => {
        // Try to get the org ID from the cache first
        const cachedOrgId = await this.cache.getOrgId();
        if (cachedOrgId) {
            return cachedOrgId;
        }

        // If not in cache, fetch from the API
        try {
            const response = await this.#loadDocsForUrl();
            if (response == null) {
                return undefined;
            }
            await this.cache.setOrgId(response.orgId);
            return response.orgId;
        } catch (error) {
            return undefined;
        }
    };

    #getClient = () => new FdrClient({ environment: this.environment });
    #loadDocsForUrl = async (): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse | undefined> => {
        const response = await this.#getClient().docs.v2.read.getDocsForUrl({ url: FdrAPI.Url(this.domain) });
        if (!response.ok) {
            return undefined;
        }
        return response.body;
    };
}
