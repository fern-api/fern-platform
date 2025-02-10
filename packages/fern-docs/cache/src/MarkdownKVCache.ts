import { kv } from "@vercel/kv";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class MarkdownKVCache {
  private static instances = new Map<string, MarkdownKVCache>();
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

  public async getMarkdownText(
    key: string
  ): Promise<string | FernDocs.ResolvedMdx | null> {
    try {
      return await kv.get<string>(this.createKey(key));
    } catch (e) {
      console.error(`Could not get ${key} from cache`, e);
      return null;
    }
  }

  public async mgetMarkdownText(
    keys: string[]
  ): Promise<Record<string, string | FernDocs.ResolvedMdx>> {
    const toRet: Record<string, string | FernDocs.ResolvedMdx> = {};
    try {
      const batchSize = 100; // Adjust this value based on Vercel Upstash limits
      const batches = [];
      for (let i = 0; i < keys.length; i += batchSize) {
        batches.push(keys.slice(i, i + batchSize));
      }

      const batchPromises = batches.map(async (batch) => {
        const batchKeys = batch.map((key) => this.createKey(key));
        return await kv.mget<(string | FernDocs.ResolvedMdx | null)[]>(
          batchKeys
        );
      });

      const responses = await Promise.all(batchPromises);

      batches.forEach((batch, batchIndex) => {
        const response = responses[batchIndex];
        batch.forEach((key, index) => {
          const value = response?.[index];
          if (value != null) {
            toRet[key] = value;
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
    return toRet;
  }

  public async setMarkdownText(
    key: string,
    markdownText: string | FernDocs.ResolvedMdx
  ): Promise<void> {
    try {
      await kv.set(this.createKey(key), markdownText);
    } catch (e) {
      console.error(`Could not set ${key} in cache`, e);
    }
  }

  // TODO: validate that mset records is <1MB or else this will throw!
  public async msetMarkdownText(
    records: Record<string, string | FernDocs.ResolvedMdx>,
    batchSize = 100
  ): Promise<void> {
    try {
      const entries = Object.entries(records).map(
        ([key, value]) => [this.createKey(key), value] as const
      );
      const batches = [];
      while (entries.length > 0) {
        batches.push(entries.splice(0, batchSize)); // batched
      }
      await Promise.all(
        batches.map((batch) => kv.mset(Object.fromEntries(batch)))
      );
    } catch (e) {
      console.error(e);
    }
  }
}
