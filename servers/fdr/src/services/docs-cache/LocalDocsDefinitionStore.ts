import { CachedDocsResponse } from "./DocsCacheInterface";

export default class LocalDocsDefinitionStore {
    private localCache: Record<string, CachedDocsResponse>;

    public constructor() {
        this.localCache = {};
    }

    get({ url }: { url: URL }): CachedDocsResponse {
        return this.localCache[url.hostname];
    }

    set({ url, value }: { url: URL; value: CachedDocsResponse }): void {
        this.localCache[(url.hostname, JSON.stringify(value))];
    }
}
