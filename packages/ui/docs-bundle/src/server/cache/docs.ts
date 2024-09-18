import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { provideRegistryService } from "@fern-ui/ui";
import { kv } from "@vercel/kv";

const SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "development0";
const PREFIX = `docs:${SHA}`;

function getCacheKey(host: string, path: string | string[]): string {
    return `${PREFIX}:${host}:${Array.isArray(path) ? path.join("/") : path}`;
}

export class DocsCache {
    private static instance: Map<string, DocsCache>;

    private constructor(private domain: string) {}

    public static getInstance(domain: string): DocsCache {
        if (!DocsCache.instance) {
            DocsCache.instance = new Map<string, DocsCache>();
        }

        const instance = DocsCache.instance.get(domain);
        if (!instance) {
            const newInstance = new DocsCache(domain);
            DocsCache.instance.set(domain, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    public async hydrate(value: FdrAPI.docs.v2.read.LoadDocsForUrlResponse): Promise<Record<string, unknown>> {
        const { navigation, ...config } = value.definition.config;
        const contents: Record<string, unknown> = {};

        async function set(key: string, content: unknown): Promise<void> {
            await kv.set(key, content);
            contents[key] = content;
        }

        async function mset(map: Record<string, unknown>): Promise<void> {
            await kv.mset(map);
            Object.assign(contents, map);
        }

        await set(getCacheKey(value.baseUrl.domain, "config"), config);
        await mset({
            [getCacheKey(value.baseUrl.domain, "basepath")]: value.baseUrl.basePath ?? "",
            [getCacheKey(value.baseUrl.domain, "config")]: config,
            [getCacheKey(value.baseUrl.domain, "search")]: value.definition.search,
            [getCacheKey(value.baseUrl.domain, "apis")]: Object.keys(value.definition.apis),
            [getCacheKey(value.baseUrl.domain, "files")]: Object.keys(value.definition.filesV2),
            [getCacheKey(value.baseUrl.domain, "pages")]: Object.keys(value.definition.pages),
        });
        await set(
            getCacheKey(value.baseUrl.domain, "navigation"),
            FernNavigation.utils.convertLoadDocsForUrlResponse(value),
        );
        for (const api of Object.values(value.definition.apis)) {
            await set(getCacheKey(value.baseUrl.domain, ["api", api.id]), api);
        }
        const files: Record<string, FdrAPI.docs.v1.read.File_> = {};
        for (const [fileId, file] of Object.entries(value.definition.filesV2)) {
            files[getCacheKey(value.baseUrl.domain, ["file", fileId])] = file;
        }
        await mset(files);
        for (const [pageId, page] of Object.entries(value.definition.pages)) {
            await set(getCacheKey(value.baseUrl.domain, ["file", pageId]), page);
        }

        await set(getCacheKey(value.baseUrl.domain, "keys"), Object.keys(contents));

        return contents;
    }

    public async reload(): Promise<Record<string, unknown>> {
        const docs = await provideRegistryService().docs.v2.read.getDocsForUrl({ url: this.domain });
        if (docs.ok) {
            return this.hydrate(docs.body);
        }
        throw new Error("Failed to reload docs");
    }

    private async lookup<T>(key: string): Promise<T> {
        const value = (await kv.get(key)) ?? (await this.reload().then((content) => content[key]));
        return value as T;
    }

    public async lookupKeys(): Promise<string[]> {
        return this.lookup(getCacheKey(this.domain, "keys"));
    }

    public async lookupBasePath(): Promise<string> {
        return this.lookup(getCacheKey(this.domain, "basepath"));
    }

    public async lookupConfig(): Promise<Omit<FdrAPI.docs.v1.read.DocsConfig, "navigation">> {
        return this.lookup(getCacheKey(this.domain, "config"));
    }

    public async lookupSearch(): Promise<FdrAPI.SearchInfo | null> {
        return this.lookup(getCacheKey(this.domain, "search"));
    }

    public async lookupNavigation(): Promise<FernNavigation.RootNode> {
        return this.lookup(getCacheKey(this.domain, "navigation"));
    }

    public async lookupApi(apiId: string): Promise<FdrAPI.api.v1.read.ApiDefinition> {
        return this.lookup(getCacheKey(this.domain, ["api", apiId]));
    }

    public async lookupFile(fileId: string): Promise<FdrAPI.docs.v1.read.File_> {
        return this.lookup(getCacheKey(this.domain, ["file", fileId]));
    }

    public async lookupPage(pageId: string): Promise<FdrAPI.docs.v1.read.File_> {
        return this.lookup(getCacheKey(this.domain, ["page", pageId]));
    }
}
