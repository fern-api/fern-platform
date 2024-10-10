import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { kv } from "@vercel/kv";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class MarkdownKVCache {
    private static instances: Map<string, MarkdownKVCache> = new Map();
    public static getInstance(domain: string): MarkdownKVCache {
        const instance = MarkdownKVCache.instances.get(domain);
        if (!instance) {
            const newInstance = new MarkdownKVCache(domain);
            MarkdownKVCache.instances.set(domain, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    private constructor(private domain: string) {}

    private createKey(key: string): string {
        return `${PREFIX}:${this.domain}:${key}`;
    }

    public async getMarkdownText(key: string): Promise<FernDocs.MarkdownText | null> {
        try {
            return kv.get<string>(this.createKey(key));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not get ${key} from cache`, e);
            return null;
        }
    }

    public async mgetMarkdownText(keys: string[]): Promise<Record<string, FernDocs.MarkdownText>> {
        const toRet: Record<string, FernDocs.MarkdownText> = {};
        try {
            const response = await kv.mget<(FernDocs.MarkdownText | null)[]>(keys.map((key) => this.createKey(key)));
            keys.map((key, index) => [key, response[index] ?? null] as const).forEach(([key, value]) => {
                if (value != null) {
                    toRet[key] = value;
                }
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
        return toRet;
    }

    public async setMarkdownText(key: string, markdownText: FernDocs.MarkdownText): Promise<void> {
        try {
            await kv.set(this.createKey(key), markdownText);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not set ${key} in cache`, e);
        }
    }

    // TODO: validate that mset records is <1MB or else this will throw!
    public async msetMarkdownText(records: Record<string, FernDocs.MarkdownText>, batchSize = 100): Promise<void> {
        try {
            const entries = Object.entries(records).map(([key, value]) => [this.createKey(key), value] as const);
            const batches = [];
            while (entries.length > 0) {
                batches.push(entries.splice(0, batchSize)); // batched
            }
            await Promise.all(batches.map((batch) => kv.mset(Object.fromEntries(batch))));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
}
