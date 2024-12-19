import { kv } from "@vercel/kv";
const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export interface DocsMetadata {
    orgId: string;
    isPreviewUrl: boolean;
}

export class DocsDomainKVCache {
    private static instance: Map<string, DocsDomainKVCache> = new Map<
        string,
        DocsDomainKVCache
    >();
    public static getInstance(domain: string): DocsDomainKVCache {
        const instance = DocsDomainKVCache.instance.get(domain);
        if (!instance) {
            const newInstance = new DocsDomainKVCache(domain);
            DocsDomainKVCache.instance.set(domain, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    private constructor(private domain: string) {}

    private createKey(key: string): string {
        return `${PREFIX}:${this.domain}:${key}`;
    }

    public async getMetadata(): Promise<DocsMetadata | null> {
        const key = this.createKey("metadata");
        try {
            const metadata = await kv.get<DocsMetadata>(key);
            return metadata ?? null;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not get ${key} from cache`, e);
            return null;
        }
    }

    public async setMetadata(metadata: DocsMetadata): Promise<void> {
        const key = this.createKey("metadata");
        try {
            await kv.set(key, metadata, { ex: 24 * 60 * 60 }); // expire after 1 day
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not set ${key} in cache`, e);
        }
    }
}
