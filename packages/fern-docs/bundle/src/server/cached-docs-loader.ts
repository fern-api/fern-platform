import {
  ApiDefinition,
  DocsV1Read,
  DocsV2Read,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import { ApiDefinitionId, PageId } from "@fern-api/fdr-sdk/navigation";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { unstable_cache } from "next/cache";
import { getAuthState } from "./auth/getAuthState";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithAuthState } from "./withRbac";

export interface DocsLoader {
  host: string;
  domain: string;

  /**
   * @returns the base url (including base path) of the docs
   */
  getBaseUrl: () => Promise<{
    domain: string;
    basePath: string | undefined;
  }>;

  /**
   * @returns a map of file names to their contents
   */
  getFiles: () => Promise<
    Record<
      string,
      {
        type: "url" | "image";
        url: string;
        width?: number;
        height?: number;
        blurDataUrl?: string;
        alt?: string;
      }
    >
  >;

  /**
   * @returns the api definition for the given id
   */
  getApi: (id: string) => Promise<ApiDefinition.ApiDefinition | undefined>;

  /**
   * @returns the root node of the docs (aware of authentication)
   */
  getRoot: (
    fern_token: string | undefined
  ) => Promise<FernNavigation.RootNode | undefined>;

  /**
   * DO NOT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING.
   * This should never be exposed to the client, and should only be used for revalidation.
   * @returns the full root node of the docs (ignoring authentication)
   */
  unsafe_getFullRoot: () => Promise<FernNavigation.RootNode | undefined>;

  /**
   * @returns the config of the docs
   */
  getConfig: () => Promise<
    Omit<DocsV1Read.DocsDefinition["config"], "navigation" | "root"> | undefined
  >;

  /**
   * @returns the markdown content for the given page id
   */
  getPage: (pageId: PageId) => Promise<
    | {
        markdown: string;
        editThisPageUrl?: string;
      }
    | undefined
  >;

  /**
   * @returns a map of file names to their contents
   */
  getMdxBundlerFiles: () => Promise<Record<string, string>>;
}

/**
 * Force cache the loadWithUrl call, so that `JSON.parse()` is called only once.
 */
export const createCachedDocsLoader = (
  domain: string,
  host: string
): DocsLoader => {
  return {
    host,
    domain,
    getBaseUrl: unstable_cache(
      async (): Promise<DocsV2Read.BaseUrl> => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return { domain, basePath: undefined };
        }
        return response.body.baseUrl;
      },
      ["base-url", domain],
      { tags: [domain], revalidate: false }
    ),
    getFiles: unstable_cache(
      async (): Promise<DocsV1Read.DocsDefinition["filesV2"]> => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return {};
        }
        return response.body.definition.filesV2;
      },
      ["files", domain],
      { tags: [domain], revalidate: false }
    ),
    getApi: unstable_cache(
      async (id: string): Promise<ApiDefinition.ApiDefinition | undefined> => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        return response.body.definition.apisV2[ApiDefinitionId(id)];
      },
      ["api", domain],
      { tags: [domain], revalidate: false }
    ),
    getRoot: unstable_cache(
      async (
        fern_token?: string | undefined
      ): Promise<FernNavigation.RootNode | undefined> => {
        const authConfig = await getAuthEdgeConfig(domain);
        const authState = await getAuthState(
          domain,
          host,
          fern_token,
          undefined,
          authConfig
        );
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        const v1 = response.body.definition.config.root;

        if (!v1) {
          return undefined;
        }

        const root =
          FernNavigation.migrate.FernNavigationV1ToLatest.create().root(v1);

        if (authConfig) {
          return pruneWithAuthState(authState, authConfig, root);
        }

        return root;
      },
      ["root", domain],
      { tags: [domain], revalidate: false }
    ),
    /**
     * beware: this returns the full tree, and ignores authentication.
     * do not use this except for revalidation.
     */
    unsafe_getFullRoot: unstable_cache(
      async () => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        const v1 = response.body.definition.config.root;

        if (!v1) {
          return undefined;
        }

        return FernNavigation.migrate.FernNavigationV1ToLatest.create().root(
          v1
        );
      },
      ["full-route", domain],
      { tags: [domain], revalidate: false }
    ),
    getConfig: unstable_cache(
      async () => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        const { navigation, root, ...config } = response.body.definition.config;
        return config;
      },
      ["config", domain],
      { tags: [domain], revalidate: false }
    ),
    getPage: unstable_cache(
      async (pageId: PageId) => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        return response.body.definition.pages[pageId];
      },
      ["page", domain],
      { tags: [domain], revalidate: false }
    ),
    getMdxBundlerFiles: unstable_cache(
      async () => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return {};
        }
        return response.body.definition.jsFiles ?? {};
      },
      ["mdx-bundler-files", domain],
      { tags: [domain], revalidate: false }
    ),
  };
};
