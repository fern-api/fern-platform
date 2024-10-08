import type { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { MarkdownKVCache } from "./MarkdownKVCache";

export class MarkdownLoader {
    public static create(domain: string): MarkdownLoader {
        return new MarkdownLoader(domain);
    }

    private cache: MarkdownKVCache;
    private constructor(domain: string) {
        this.cache = MarkdownKVCache.getInstance(domain);
    }

    private pages: Record<FernNavigation.PageId, DocsV1Read.PageContent> = {};
    public withPages(pages: Record<FernNavigation.PageId, DocsV1Read.PageContent>): MarkdownLoader {
        this.pages = { ...this.pages, ...pages };
        return this;
    }

    // this is the docs instance id
    private instanceId: string | undefined;
    public withInstanceId(instanceId: string): MarkdownLoader {
        this.instanceId = instanceId;
        return this;
    }

    #serializeMdx = async (
        mdx: string,
        _pageId: FernNavigation.PageId,
        _title: string | undefined,
        _breadcrumb: FernNavigation.BreadcrumbItem[],
        _editThisPageUrl: FernNavigation.Url | undefined,
    ): Promise<FernDocs.MarkdownText> => Promise.resolve(mdx);
    #engine = "raw";
    public withMdxBundler = (
        fn: (
            mdx: string,
            pageId: FernNavigation.PageId,
            title: string | undefined,
            breadcrumb: FernNavigation.BreadcrumbItem[],
            editThisPageUrl: FernNavigation.Url | undefined,
        ) => Promise<FernDocs.MarkdownText>,
        engine: string,
    ): MarkdownLoader => {
        this.#serializeMdx = fn;
        this.#engine = engine;
        return this;
    };

    public async load(
        node: FernNavigation.NavigationNodeWithMarkdown,
        breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    ): Promise<FernDocs.MarkdownText | undefined> {
        const pageId = FernNavigation.getPageId(node);

        if (!pageId) {
            return;
        }

        const cacheKey = `${this.instanceId}:${this.#engine}:${node.id}`;

        // instanceId is required to load from cache because the instanceId is used to invalidate the cache
        // when a new version of the docs is deployed
        if (this.instanceId) {
            const cached = await this.cache.getMarkdownText(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const page = this.pages[pageId];
        if (!page) {
            return;
        }

        const serialized = await this.#serializeMdx(
            page.markdown,
            pageId,
            node.title,
            [...(breadcrumb ?? [])],
            page.editThisPageUrl,
        );

        if (this.instanceId) {
            await this.cache.setMarkdownText(cacheKey, serialized);
        }

        return serialized;
    }
}
