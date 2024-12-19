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
  public withPages(
    pages: Record<FernNavigation.PageId, DocsV1Read.PageContent>
  ): MarkdownLoader {
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
    _pageId: FernNavigation.PageId | undefined
  ): Promise<FernDocs.MarkdownText> => Promise.resolve(mdx);
  #engine = "raw";
  public withMdxBundler = (
    fn: (
      mdx: string,
      pageId: FernNavigation.PageId | undefined
    ) => Promise<FernDocs.MarkdownText>,
    engine: string
  ): MarkdownLoader => {
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

  public getEditThisPageUrl(
    node: FernNavigation.NavigationNodeWithMarkdown
  ): FernNavigation.Url | undefined {
    const pageId = FernNavigation.getPageId(node);
    if (!pageId) {
      return;
    }

    const page = this.pages[pageId];
    if (!page) {
      return;
    }

    return page.editThisPageUrl;
  }

  public getRawMarkdown(
    node: FernNavigation.NavigationNodeWithMarkdown
  ): { pageId: FernNavigation.PageId; markdown: string } | undefined {
    const pageId = FernNavigation.getPageId(node);
    if (!pageId) {
      return;
    }

    const page = this.pages[pageId];
    if (!page) {
      return;
    }

    return {
      pageId,
      markdown: page.markdown,
    };
  }
}
