import { FdrAPI, type DocsV1Read, type DocsV2Read } from "@fern-api/fdr-sdk";
import {
  ApiDefinition,
  ApiDefinitionV1ToLatest,
} from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig } from "@fern-docs/auth";
import { ApiDefinitionLoader, DocsKVCache, DocsLoader } from "@fern-docs/cache";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { provideRegistryService } from "@fern-docs/ui";
import { chunk, zip } from "es-toolkit/array";
import { omitBy } from "es-toolkit/object";
import { isNonNullish } from "../../../../commons/core-utils/src/isNonNullish";
import { getAuthState, type AuthState } from "./auth/getAuthState";
import { loadDocsDefinitionFromS3 } from "./loadDocsDefinitionFromS3";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithAuthState } from "./withRbac";

interface DocsLoaderFlags {
  isBatchStreamToggleDisabled: boolean;
  isApiScrollingDisabled: boolean;

  // for api definition:
  useJavaScriptAsTypeScript: boolean;
  alwaysEnableJavaScriptFetch: boolean;
  usesApplicationJsonInFormDataValue: boolean;
}

export class DocsLoaderImpl implements DocsLoader {
  static for(domain: string, host: string, fernToken?: string): DocsLoaderImpl {
    return new DocsLoaderImpl(domain, host, fernToken);
  }

  #cache: DocsKVCache;
  #domain: string;
  #host: string;
  #fernToken: string | undefined;
  private constructor(
    domain: string,
    host: string,
    fernToken: string | undefined
  ) {
    this.#cache = DocsKVCache.getInstance(domain);
    this.#domain = domain;
    this.#host = host;
    this.#fernToken = fernToken;
  }

  public get domain(): string {
    return this.#domain;
  }

  private edgeFlags: DocsLoaderFlags | undefined;
  public withEdgeFlags(edgeFlags: DocsLoaderFlags): this {
    this.edgeFlags = edgeFlags;
    return this;
  }

  private async getEdgeFlags(): Promise<DocsLoaderFlags> {
    if (!this.edgeFlags) {
      const edgeFlags = await getEdgeFlags(this.domain);
      this.edgeFlags = edgeFlags;
    }
    return this.edgeFlags;
  }

  private authConfig: AuthEdgeConfig | undefined;
  private authState: AuthState | undefined;
  public withAuth(
    authConfig: AuthEdgeConfig | undefined,
    authState?: AuthState
  ): this {
    this.authConfig = authConfig;
    if (authState) {
      this.authState = authState;
    }
    return this;
  }

  private async loadAuth(): Promise<[AuthState, AuthEdgeConfig | undefined]> {
    if (!this.authConfig) {
      this.authConfig = await getAuthEdgeConfig(this.domain);
    }
    if (this.authState) {
      return [this.authState, this.authConfig];
    }
    return [
      await getAuthState(
        this.#domain,
        this.#host,
        this.#fernToken,
        undefined,
        this.authConfig
      ),
      this.authConfig,
    ];
  }

  public async isAuthed(): Promise<boolean> {
    const [authState] = await this.loadAuth();
    return authState.authed;
  }

  #loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse | undefined;
  #error: DocsV2Read.getDocsForUrl.Error | undefined;

  get error(): DocsV2Read.getDocsForUrl.Error | undefined {
    return this.#error;
  }

  public withLoadDocsForUrlResponse(
    loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse
  ): this {
    this.#loadForDocsUrlResponse = loadForDocsUrlResponse;
    return this;
  }

  public async getApiDefinitionLoader(
    key: FernNavigation.ApiDefinitionId
  ): Promise<ApiDefinitionLoader | undefined> {
    const res = await this.loadDocs();
    if (!res) {
      return undefined;
    }
    const v1 = res.definition.apis[key];
    const latest =
      res.definition.apisV2?.[key] ??
      (v1 != null
        ? ApiDefinitionV1ToLatest.from(v1, await this.getEdgeFlags()).migrate()
        : undefined);
    if (!latest) {
      return undefined;
    }
    // always create a new instance because pruning mutates the loader
    return ApiDefinitionLoader.create(this.domain, key)
      .withApiDefinition(latest)
      .withEdgeFlags(await this.getEdgeFlags())
      .withResolveDescriptions(false)
      .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN);
  }

  public async loadAllApis(): Promise<
    Record<FernNavigation.ApiDefinitionId, ApiDefinition>
  > {
    const docs = await this.loadDocs();
    const keys = Object.keys({
      ...docs?.definition.apis,
      ...docs?.definition.apisV2,
    }).map(FernNavigation.ApiDefinitionId);
    const apis = await batchPromiseAll(keys, (key) =>
      this.getApiDefinitionLoader(key).then((loader) => loader?.load())
    );
    return omitBy(apis, isNonNullish) as Record<
      FernNavigation.ApiDefinitionId,
      ApiDefinition
    >;
  }

  private getDocsDefinitionUrl() {
    return (
      process.env.NEXT_PUBLIC_DOCS_DEFINITION_S3_URL ??
      "https://docs-definitions.buildwithfern.com"
    );
  }

  private async loadDocs(): Promise<
    DocsV2Read.LoadDocsForUrlResponse | undefined
  > {
    if (!this.#loadForDocsUrlResponse) {
      try {
        return await loadDocsDefinitionFromS3({
          domain: this.domain,
          docsDefinitionUrl: this.getDocsDefinitionUrl(),
        });
      } catch {
        // Not served by cloudfront, fetch from Redis and then RDS
        const response = await loadWithUrl(this.domain);
        if (response.ok) {
          this.#loadForDocsUrlResponse = response.body;
        } else {
          this.#error = response.error;
        }
      }
    }
    return this.#loadForDocsUrlResponse;
  }

  public async unprunedRoot(): Promise<FernNavigation.RootNode | undefined> {
    const docs = await this.loadDocs();

    if (!docs) {
      return undefined;
    }

    return FernNavigation.utils.toRootNode(docs);
  }

  public async root(): Promise<FernNavigation.RootNode | undefined> {
    const [authState, authConfig] = await this.loadAuth();
    let root = await this.unprunedRoot();

    // if the user is not authenticated, and the page requires authentication, prune the navigation tree
    // to only show pages that are allowed to be viewed without authentication.
    // note: the middleware will not show this page at all if the user is not authenticated.
    if (root && authConfig) {
      try {
        // TODO: store this in cache
        root = pruneWithAuthState(authState, authConfig, root);
      } catch (e) {
        // TODO: sentry

        console.error(e);
        return undefined;
      }
    }

    // TODO: prune with feature flags state

    return root;
  }

  private pageCache: Record<
    FernNavigation.PageId,
    { markdown: string; sourceUrl: string | undefined }
  > = {};

  public async getPage(
    pageId: FernNavigation.PageId
  ): Promise<{ markdown: string; sourceUrl: string | undefined } | undefined> {
    if (this.pageCache[pageId] != null) {
      return this.pageCache[pageId];
    }
    const docs = await this.loadDocs();
    const page = docs?.definition.pages[pageId];
    if (!page) {
      return undefined;
    }
    let markdown = page.markdown;
    if (markdown == null && page.url != null) {
      const fileResponse = await retryableFetch(page.url);
      if (fileResponse.ok) {
        markdown = await fileResponse.text();
      }
    }
    if (!markdown) {
      return undefined;
    }
    this.pageCache[pageId] = {
      markdown,
      sourceUrl: page.editThisPageUrl,
    };
    return this.pageCache[pageId];
  }

  public async getAllPages(): Promise<
    Record<
      FernNavigation.PageId,
      { markdown: string; sourceUrl: string | undefined }
    >
  > {
    const docs = await this.loadDocs();
    const pages = await batchPromiseAll(
      Object.keys(docs?.definition.pages ?? {}).map((pageId) =>
        FernNavigation.PageId(pageId)
      ),
      (pageId) => this.getPage(pageId)
    );
    return omitBy(pages, isNonNullish) as Record<
      FernNavigation.PageId,
      { markdown: string; sourceUrl: string | undefined }
    >;
  }

  // NOTE: authentication is based on the navigation nodes, so we don't need to check it here,
  // as long as these pages are NOT shipped to the client-side.
  public async pages(): Promise<
    Record<FernNavigation.PageId, DocsV1Read.PageContent>
  > {
    const docs = await this.loadDocs();
    return docs?.definition.pages ?? {};
  }

  public async files(): Promise<
    Record<FernNavigation.FileId, DocsV1Read.File_>
  > {
    const docs = await this.loadDocs();
    return docs?.definition.filesV2 ?? {};
  }

  public async getFile(
    fileId: FernNavigation.FileId
  ): Promise<DocsV1Read.File_ | undefined> {
    const docs = await this.loadDocs();
    return docs?.definition.filesV2[fileId];
  }

  public getMetadata = async (): Promise<
    { orgId: string; isPreviewUrl: boolean } | undefined
  > => {
    // Try to get the org ID from the cache first
    const metadata = await this.#cache.getMetadata();
    if (metadata != null) {
      return metadata;
    }

    // If not in cache, fetch from the API
    try {
      const response = await this.#loadMetadataForUrl();
      if (response == null) {
        return undefined;
      }
      const metadata = {
        isPreviewUrl: response.isPreviewUrl,
        orgId: response.org,
      };
      await this.#cache.setMetadata(metadata);
      return metadata;
    } catch (_error) {
      return undefined;
    }
  };

  #loadMetadataForUrl = async (): Promise<
    FdrAPI.docs.v2.read.DocsUrlMetadata | undefined
  > => {
    const response =
      await provideRegistryService().docs.v2.read.getDocsUrlMetadata(
        { url: FdrAPI.Url(this.domain) },
        { timeoutInSeconds: 3 }
      );
    if (!response.ok) {
      return undefined;
    }
    return response.body;
  };

  public async getDocsConfig(): Promise<DocsV1Read.DocsConfig | undefined> {
    const docs = await this.loadDocs();
    return docs?.definition.config;
  }
}

async function retryableFetch(
  url: string,
  options?: RequestInit,
  attempts = 3
): Promise<Response> {
  let attempt = 0;
  while (attempt < attempts) {
    try {
      return await fetch(url, options);
    } catch (_e) {
      if (attempt >= attempts) {
        throw _e;
      }
      const backoffDelay = attempt * 1000; // Exponential backoff delay
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
    attempt++;
  }
  throw new Error("Failed to fetch");
}

async function batchPromiseAll<K extends string, T>(
  keys: K[],
  fn: (key: K) => Promise<T>,
  concurrency = 10
): Promise<Record<K, T>> {
  const results: Record<string, T> = {};
  const batchedKeys = chunk(keys, concurrency);
  for (const batch of batchedKeys) {
    const batchResults = await Promise.all(batch.map(fn));
    zip(batch, batchResults).forEach(([key, value]) => {
      results[key] = value;
    });
  }
  return results;
}
