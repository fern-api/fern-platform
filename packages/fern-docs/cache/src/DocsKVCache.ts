import type { FernNavigation } from "@fern-api/fdr-sdk";
import { kv } from "@vercel/kv";
const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export interface DocsMetadata {
  orgId: string;
  isPreviewUrl: boolean;
}

export class DocsKVCache {
  private static instance: Map<string, DocsKVCache> = new Map<
    string,
    DocsKVCache
  >();
  public static getInstance(domain: string): DocsKVCache {
    const instance = DocsKVCache.instance.get(domain);
    if (!instance) {
      const newInstance = new DocsKVCache(domain);
      DocsKVCache.instance.set(domain, newInstance);
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
      console.error(`Could not get ${key} from cache`, e);
      return null;
    }
  }

  public async setMetadata(metadata: DocsMetadata): Promise<void> {
    const key = this.createKey("metadata");
    try {
      await kv.set(key, metadata, { ex: 24 * 60 * 60 }); // expire after 1 day
    } catch (e) {
      console.error(`Could not set ${key} in cache`, e);
    }
  }

  public async addVisitedSlugs(...slug: FernNavigation.Slug[]): Promise<void> {
    await kv.sadd(this.createKey("visited-slugs"), ...slug);
  }

  public async getVisitedSlugs(): Promise<FernNavigation.Slug[]> {
    return kv.smembers(this.createKey("visited-slugs"));
  }

  public async removeVisitedSlugs(
    ...slug: FernNavigation.Slug[]
  ): Promise<void> {
    await kv.srem(this.createKey("visited-slugs"), ...slug);
  }
}
