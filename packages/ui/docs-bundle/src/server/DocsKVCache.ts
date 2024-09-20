import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { ResolvedRootPackage } from "@fern-ui/ui";
import { kv } from "@vercel/kv";
import { BundledMDX } from "../../../app/src/mdx/types";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development_v0";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class DocsKVCache {
    private static instance: Map<string, DocsKVCache>;

    private constructor(private domain: string) {}

    public static for(domain: string): DocsKVCache {
        if (!DocsKVCache.instance) {
            DocsKVCache.instance = new Map<string, DocsKVCache>();
        }

        const instance = DocsKVCache.instance.get(domain);
        if (!instance) {
            const newInstance = new DocsKVCache(domain);
            DocsKVCache.instance.set(domain, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    public visitedSlugs = {
        add: this.addVisitedSlugs,
        get: this.getVisitedSlugs,
        remove: this.removeVisitedSlugs,
    };

    private async addVisitedSlugs(...slug: FernNavigation.Slug[]): Promise<void> {
        try {
            await kv.sadd(`${PREFIX}:${this.domain}:visited-slugs`, ...slug);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    private async getVisitedSlugs(): Promise<FernNavigation.Slug[]> {
        try {
            return kv.smembers(`${PREFIX}:${this.domain}:visited-slugs`);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return [];
        }
    }

    private async removeVisitedSlugs(...slug: FernNavigation.Slug[]): Promise<void> {
        try {
            await kv.srem(`${PREFIX}:${this.domain}:visited-slugs`, ...slug);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    /**
     * @returns true if the cache was updated, false otherwise
     */
    public async set(docs: FdrAPI.docs.v2.read.LoadDocsForUrlResponse): Promise<boolean> {
        if (!docs.definition.id) {
            return false;
        }
        // const { navigation, ...config } = docs.definition.config;
        await kv.set(`${PREFIX}:${this.domain}:id`, docs.definition.id);

        const instance = this.get(docs.definition.id);

        try {
            await Promise.all([
                instance.setNavigation(FernNavigation.utils.convertLoadDocsForUrlResponse(docs)),
                instance.setFiles(docs.definition.filesV2),
                instance.setPages(docs.definition.pages),
                instance.setApis(docs.definition.apis),
            ]);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return false;
        }
        return true;
    }

    public get(id: string): DocsInstanceCache {
        return new DocsInstanceCache(this.domain, id);
    }
}

class DocsInstanceCache {
    constructor(
        private domain: string,
        private id: string,
    ) {}

    get keys() {
        return {
            navigation: `${PREFIX}:${this.domain}:${this.id}:navigation`,
            file: (fileId: string) => `${PREFIX}:${this.domain}:${this.id}:file:${fileId}`,
            page: (pageId: string) => `${PREFIX}:${this.domain}:${this.id}:page:${pageId}`,
            api: (apiId: string) => `${PREFIX}:${this.domain}:${this.id}:api:${apiId}`,
            compiledPage: (pageId: string) => `${PREFIX}:${this.domain}:${this.id}:page.compiled:${pageId}`,
            compiledApi: (apiId: string) => `${PREFIX}:${this.domain}:${this.id}:api:.compiled${apiId}`,
            pages: `${PREFIX}:${this.domain}:${this.id}:pages`,
            apis: `${PREFIX}:${this.domain}:${this.id}:apis`,
        };
    }

    public setNavigation(navigation: FernNavigation.RootNode): Promise<"OK"> {
        return kv.mset({
            [this.keys.navigation]: navigation,
        });
    }

    public setFiles(files: Record<string, FdrAPI.docs.v1.read.File_>): Promise<"OK"> {
        return kv.mset({
            ...Object.fromEntries(Object.entries(files).map(([fileId, file]) => [this.keys.file(fileId), file])),
        });
    }

    public setPages(pages: Record<string, FdrAPI.docs.v1.read.PageContent>): Promise<"OK"> {
        return kv.mset({
            [this.keys.pages]: Object.keys(pages),
            ...Object.fromEntries(Object.entries(pages).map(([pageId, page]) => [this.keys.page(pageId), page])),
        });
    }

    public setApis(apis: Record<string, FdrAPI.api.v1.read.ApiDefinition>): Promise<"OK"> {
        return kv.mset({
            [this.keys.apis]: Object.keys(apis),
            ...Object.fromEntries(Object.entries(apis).map(([apiId, api]) => [this.keys.api(apiId), api])),
        });
    }

    public setCompiledPage(pageId: string, compiled: BundledMDX): Promise<"OK"> {
        return kv.mset({
            [this.keys.compiledPage(pageId)]: compiled,
        });
    }

    public setCompiledApi(apiId: string, compiled: ResolvedRootPackage): Promise<"OK"> {
        return kv.mset({
            [this.keys.compiledApi(apiId)]: compiled,
        });
    }

    public getFile(fileId: string): Promise<FdrAPI.docs.v1.read.File_ | null> {
        return kv.get(this.keys.file(fileId));
    }

    public getNavigation(): Promise<FernNavigation.RootNode | null> {
        return kv.get(this.keys.navigation);
    }

    public async getPageIds(): Promise<string[]> {
        return (await kv.get(this.keys.pages)) ?? [];
    }

    public async getApiIds(): Promise<string[]> {
        return (await kv.get(this.keys.apis)) ?? [];
    }

    public getPage(pageId: string): Promise<FdrAPI.docs.v1.read.PageContent | null> {
        return kv.get(this.keys.page(pageId));
    }

    public getApi(apiId: string): Promise<FdrAPI.api.v1.read.ApiDefinition | null> {
        return kv.get(this.keys.api(apiId));
    }

    public async getCompiledPage(pageId: string): Promise<BundledMDX | null> {
        return kv.get(this.keys.compiledPage(pageId));
    }

    public async getCompiledApi(apiId: string): Promise<ResolvedRootPackage | null> {
        return kv.get(this.keys.compiledApi(apiId));
    }

    // public async getPages(pageIds: string[]): Promise<Record<string, FdrAPI.docs.v1.read.PageContent>> {
    //     const pages = (await kv.mget(
    //         pageIds.map((pageId) => this.keys.page(pageId)),
    //     )) as (FdrAPI.docs.v1.read.PageContent | null)[];
    //     if (pages.length !== pageIds.length) {
    //         return {};
    //     }
    //     const result: Record<string, FdrAPI.docs.v1.read.PageContent> = {};
    //     for (let i = 0; i < pageIds.length; i++) {
    //         const pageId = pageIds[i];
    //         const page = pages[i];
    //         if (pageId && page) {
    //             result[pageId] = page;
    //         }
    //     }
    //     return result;
    // }

    // public async getApis(apiIds: string[]): Promise<Record<string, FdrAPI.api.v1.read.ApiDefinition>> {
    //     const apis = (await kv.mget(
    //         apiIds.map((apiId) => this.keys.api(apiId)),
    //     )) as (FdrAPI.api.v1.read.ApiDefinition | null)[];
    //     if (apis.length !== apiIds.length) {
    //         return {};
    //     }
    //     const result: Record<string, FdrAPI.api.v1.read.ApiDefinition> = {};
    //     for (let i = 0; i < apiIds.length; i++) {
    //         const apiId = apiIds[i];
    //         const api = apis[i];
    //         if (apiId && api) {
    //             result[apiId] = api;
    //         }
    //     }
    //     return result;
    // }

    // public async getCompiledPages(pageIds: string[]): Promise<Record<string, BundledMDX>> {
    //     const compiledPages = (await kv.mget(
    //         pageIds.map((pageId) => this.keys.compiledPage(pageId)),
    //     )) as (BundledMDX | null)[];
    //     if (compiledPages.length !== pageIds.length) {
    //         return {};
    //     }
    //     const result: Record<string, BundledMDX> = {};
    //     for (let i = 0; i < pageIds.length; i++) {
    //         const pageId = pageIds[i];
    //         const compiledPage = compiledPages[i];
    //         if (pageId && compiledPage) {
    //             result[pageId] = compiledPage;
    //         }
    //     }
    //     return result;
    // }

    // public async getCompiledApis(apiIds: string[]): Promise<Record<string, ResolvedRootPackage>> {
    //     const compiledApis = (await kv.mget(
    //         apiIds.map((apiId) => this.keys.compiledApi(apiId)),
    //     )) as (ResolvedRootPackage | null)[];
    //     if (compiledApis.length !== apiIds.length) {
    //         return {};
    //     }
    //     const result: Record<string, ResolvedRootPackage> = {};
    //     for (let i = 0; i < apiIds.length; i++) {
    //         const apiId = apiIds[i];
    //         const compiledApi = compiledApis[i];
    //         if (apiId && compiledApi) {
    //             result[apiId] = compiledApi;
    //         }
    //     }
    //     return result;
    // }
}
