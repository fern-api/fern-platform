import { FdrAPI, FdrClient } from "@fern-api/fdr-sdk";
import { DocsDomainKVCache } from "./DocsKVCache";

export interface DocsMetadata {
    orgId: string;
    isPreviewUrl: boolean;
}

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

    public getMetadata = async (): Promise<DocsMetadata | undefined> => {
        // Try to get the org ID from the cache first
        const metadata = await this.cache.getMetadata();
        if (metadata != null) {
            return metadata;
        }

        // If not in cache, fetch from the API
        try {
            const response = await this.#loadMetadataForUrl();
            if (response == null) {
                return undefined;
            }
            const metadata = { isPreviewUrl: response.isPreviewUrl, orgId: response.org };
            await this.cache.setMetadata(metadata);
            return metadata;
        } catch (error) {
            return undefined;
        }
    };

    #getClient = () => new FdrClient({ environment: this.environment });
    #loadMetadataForUrl = async (): Promise<FdrAPI.docs.v2.read.DocsUrlMetadata | undefined> => {
        const response = await this.#getClient().docs.v2.read.getDocsUrlMetadata(
            { url: FdrAPI.Url(this.domain) },
            { timeoutInSeconds: 180 },
        );
        if (!response.ok) {
            return undefined;
        }
        return response.body;
    };
}
