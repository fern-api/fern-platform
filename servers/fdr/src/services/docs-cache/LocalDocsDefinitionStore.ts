import { CachedDocsResponse } from "./DocsDefinitionCache";

export default class LocalDocsDefinitionStore {
    private localCache: Record<string, CachedDocsResponse>;

    public constructor() {
        this.localCache = {};
    }

    get({ url }: { url: URL }): CachedDocsResponse | undefined {
        return this.localCache[url.hostname];
    }

    set({ url, value }: { url: URL; value: CachedDocsResponse }): void {
        this.localCache[(url.hostname, JSON.stringify(value))];
    }

    delete({ url }: { url: URL }): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.localCache[url.hostname];
    }
}
