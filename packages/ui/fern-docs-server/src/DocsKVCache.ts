import { kv } from "@vercel/kv";
const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class DocsDomainKVCache {
    private static instance: Map<string, DocsDomainKVCache> = new Map<string, DocsDomainKVCache>();
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

    public async getOrgId(): Promise<string | null> {
        const key = this.createKey("orgId");
        try {
            return kv.get<string>(key);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not get ${key} from cache`, e);
            return null;
        }
    }

    public async setOrgId(orgId: string): Promise<void> {
        const key = this.createKey("orgId");
        try {
            await kv.set(key, orgId);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not set ${key} in cache`, e);
        }
    }
}
