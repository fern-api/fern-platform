import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DocsLoader } from "./DocsLoader";
import { MarkdownKVCache } from "./MarkdownKVCache";

export class MarkdownLoader {
  public static create(loader: DocsLoader): MarkdownLoader {
    return new MarkdownLoader(loader);
  }

  private cache: MarkdownKVCache;
  private constructor(private loader: DocsLoader) {
    this.cache = MarkdownKVCache.getInstance(loader.domain);
  }

  // private pages: Record<FernNavigation.PageId, DocsV1Read.PageContent> = {};
  // public withPages(
  //   pages: Record<FernNavigation.PageId, DocsV1Read.PageContent>
  // ): this {
  //   this.pages = { ...this.pages, ...pages };
  //   return this;
  // }

  // this is the docs instance id
  private instanceId: string | undefined;
  public withInstanceId(instanceId: string): this {
    this.instanceId = instanceId;
    return this;
  }

  #serializeMdx = async (
    mdx: string,
    _pageId: FernNavigation.PageId | undefined
  ): Promise<FernDocs.MarkdownText> => Promise.resolve(mdx);
  #engine = "raw";
  public withMdxBundler = (
    fn: (
      mdx: string,
      pageId: FernNavigation.PageId | undefined
    ) => Promise<FernDocs.MarkdownText>,
    engine: string
  ): this => {
    this.#serializeMdx = fn;
    this.#engine = engine;
    return this;
  };

  public async serializeWithCache(
    mdx: string,
    pageId: FernNavigation.PageId | undefined,
    key: string
  ): Promise<FernDocs.MarkdownText> {
    const cacheKey = `${this.instanceId}:${this.#engine}:${pageId}:${key}`;

    if (this.instanceId) {
      const cached = await this.cache.getMarkdownText(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const serialized = await this.#serializeMdx(mdx, pageId);

    if (this.instanceId) {
      await this.cache.setMarkdownText(cacheKey, serialized);
    }

    return serialized;
  }

  public async getSourceUrl(
    node: FernNavigation.NavigationNodeWithMarkdown
  ): Promise<string | undefined> {
    const pageId = FernNavigation.getPageId(node);
    if (!pageId) {
      return;
    }

    const page = await this.loader.getPage(pageId);
    if (!page) {
      return;
    }

    return page.sourceUrl;
  }

  public async getRawMarkdown(
    node: FernNavigation.NavigationNodeWithMarkdown
  ): Promise<{ pageId: FernNavigation.PageId; markdown: string } | undefined> {
    const pageId = FernNavigation.getPageId(node);
    if (!pageId) {
      return;
    }

    const page = await this.loader.getPage(pageId);
    if (!page) {
      return;
    }

    return {
      pageId,
      markdown: page.markdown,
    };
  }
}
