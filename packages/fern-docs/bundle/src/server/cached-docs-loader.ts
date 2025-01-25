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

/**
 * Force cache the loadWithUrl call, so that `JSON.parse()` is called only once.
 */
export const createCachedDocsLoader = (domain: string, host: string) => {
  return {
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
      async (
        id: ApiDefinitionId
      ): Promise<ApiDefinition.ApiDefinition | undefined> => {
        const response = await loadWithUrl(domain);
        if (!response.ok) {
          return undefined;
        }
        return response.body.definition.apisV2[id];
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
    unsafe_getFullRoute: unstable_cache(
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
