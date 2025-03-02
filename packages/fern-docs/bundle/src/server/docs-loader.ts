import "server-only";

import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";

import { mapValues } from "es-toolkit/object";
import { UnreachableCaseError } from "ts-essentials";

import {
  ApiDefinition,
  DocsV1Read,
  DocsV2Read,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import {
  ApiDefinitionV1ToLatest,
  AuthScheme,
  ObjectProperty,
  PruningNodeType,
  TypeDefinition,
  backfillSnippets,
  prune,
} from "@fern-api/fdr-sdk/api-definition";
import {
  ApiDefinitionId,
  EndpointId,
  PageId,
  Slug,
  TypeId,
} from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish, isPlainObject } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig } from "@fern-docs/auth";
import { HttpMethod } from "@fern-docs/components";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  DEFAULT_LOGO_HEIGHT,
  EdgeFlags,
  withoutStaging,
} from "@fern-docs/utils";

import { findEndpoint } from "@/components/util/processRequestSnippetComponents";

import { AuthState, createGetAuthState } from "./auth/getAuthState";
import { cacheSeed } from "./cache-seed";
import { generateFernColorPalette } from "./generateFernColors";
import { FernFonts, generateFonts } from "./generateFonts";
import { getDocsUrlMetadata } from "./getDocsUrlMetadata";
import { loadWithUrl as uncachedLoadWithUrl } from "./loadWithUrl";
import { FernColorTheme, FernLayoutConfig, FileData } from "./types";
import { pruneWithAuthState } from "./withRbac";

const loadWithUrl = uncachedLoadWithUrl;

export interface DocsLoader {
  domain: string;
  fern_token: string | undefined;

  getAuthConfig: () => Promise<AuthEdgeConfig | undefined>;

  /**
   * @returns the base url (including base path) of the docs
   */
  getBaseUrl: () => Promise<{
    domain: string;
    basePath: string | undefined;
  }>;

  /**
   * @returns the metadata for the given url
   */
  getMetadata: () => Promise<{
    url: string;
    org: string;
    isPreview: boolean;
  }>;

  /**
   * @returns a map of file names to their contents
   */
  getFiles: () => Promise<Record<string, FileData>>;

  /**
   * @returns a map of mdx bundler files
   */
  getMdxBundlerFiles: () => Promise<Record<string, string>>;

  /**
   * @returns the api definition for the given id
   */
  getApi: (id: string) => Promise<ApiDefinition.ApiDefinition>;

  /**
   * @returns the api definition for the given id, pruned to the given nodes
   */
  getPrunedApi: (
    id: string,
    ...nodes: PruningNodeType[]
  ) => Promise<ApiDefinition.ApiDefinition>;

  /**
   * @returns the endpoint definition for the given api definition id and endpoint id
   */
  getEndpointById: (
    apiDefinitionId: string,
    endpointId: EndpointId
  ) => Promise<{
    endpoint: ApiDefinition.EndpointDefinition;
    nodes: FernNavigation.EndpointNode[];
    globalHeaders: ObjectProperty[];
    authSchemes: AuthScheme[];
    types: Record<TypeId, TypeDefinition>;
  }>;

  /**
   * @returns the endpoint definition for the given endpoint locator
   */
  getEndpointByLocator: (
    method: HttpMethod,
    path: string,
    /**
     * multiple endpoints can have the same method + path
     * the example can be used to disambiguate between them
     */
    example?: string
  ) => Promise<{
    apiDefinitionId: ApiDefinition.ApiDefinitionId;
    endpoint: ApiDefinition.EndpointDefinition;
    slugs: Slug[];
  }>;

  /**
   * @returns the root node of the docs (aware of authentication)
   */
  getRoot: () => Promise<FernNavigation.RootNode>;

  /**
   * @returns the navigation node for the given id
   */
  getNavigationNode: (id: string) => Promise<FernNavigation.NavigationNode>;

  /**
   * DO NOT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING.
   * This should never be exposed to the client, and should only be used for revalidation.
   * @returns the full root node of the docs (ignoring authentication)
   */
  unsafe_getFullRoot: () => Promise<FernNavigation.RootNode>;

  /**
   * @returns the config of the docs
   */
  getConfig: () => Promise<
    Omit<DocsV1Read.DocsDefinition["config"], "navigation" | "root">
  >;

  /**
   * @returns the markdown content for the given page id
   */
  getPage: (pageId: string) => Promise<{
    filename: string;
    markdown: string;
    editThisPageUrl?: string;
  }>;

  getColors: () => Promise<{
    light?: FernColorTheme;
    dark?: FernColorTheme;
  }>;

  getFonts: () => Promise<FernFonts>;

  getLayout: () => Promise<FernLayoutConfig>;

  getAuthState: (pathname?: string) => Promise<AuthState>;

  getEdgeFlags: () => Promise<EdgeFlags>;
}

const cachedGetEdgeFlags = cache(async (domain: string) => {
  return await getEdgeFlags(domain);
});

const getBaseUrl = async (domain: string): Promise<DocsV2Read.BaseUrl> => {
  const response = await loadWithUrl(domain);
  return {
    domain: response.baseUrl.domain,
    basePath: response.baseUrl.basePath,
  };
};

const getFiles = async (domain: string): Promise<Record<string, FileData>> => {
  const response = await loadWithUrl(domain);
  return mapValues(response.definition.filesV2, (file) => {
    if (file.type === "url") {
      return {
        src: file.url,
      };
    } else if (file.type === "image") {
      return {
        src: file.url,
        width: file.width,
        height: file.height,
        blurDataURL: file.blurDataUrl,
        alt: file.alt,
      };
    }
    throw new UnreachableCaseError(file);
  });
};

const getApi = async (domain: string, id: string) => {
  const response = await loadWithUrl(domain);
  const latest = response.definition.apisV2[ApiDefinitionId(id)];
  if (latest != null) {
    return latest;
  }
  const v1 = response.definition.apis[ApiDefinitionId(id)];
  if (v1 == null) {
    notFound();
  }
  const flags = await cachedGetEdgeFlags(domain);
  return ApiDefinitionV1ToLatest.from(v1, flags).migrate();
};

const createGetApiCached = (domain: string) =>
  unstable_cache(
    async (id: string): Promise<ApiDefinition.ApiDefinition> => {
      const [api, flags] = await Promise.all([
        getApi(domain, id),
        cachedGetEdgeFlags(domain),
      ]);
      return backfillSnippets(api, flags);
    },
    [domain, cacheSeed()],
    { tags: [domain, "api"] }
  );

const createGetPrunedApiCached = (domain: string) =>
  unstable_cache(
    async (
      id: string,
      ...nodes: PruningNodeType[]
    ): Promise<ApiDefinition.ApiDefinition> => {
      const [flags, api] = await Promise.all([
        cachedGetEdgeFlags(domain),
        getApi(domain, id),
      ]);
      return backfillSnippets(prune(api, ...nodes), flags);
    },
    [domain, cacheSeed()],
    { tags: [domain, "api"] }
  );

const getAllApisForDomain = async (
  domain: string
): Promise<ApiDefinition.ApiDefinition[]> => {
  const response = await loadWithUrl(domain);
  if (
    response.definition.apisV2 &&
    Object.keys(response.definition.apisV2).length > 0
  ) {
    return Object.values(response.definition.apisV2);
  }
  const flags = await cachedGetEdgeFlags(domain);
  return Object.values(response.definition.apis).map((v1) =>
    ApiDefinitionV1ToLatest.from(v1, flags).migrate()
  );
};

const getEndpointById = async (
  domain: string,
  apiDefinitionId: string,
  endpointId: EndpointId
): Promise<{
  endpoint: ApiDefinition.EndpointDefinition;
  nodes: FernNavigation.EndpointNode[];
  globalHeaders: ObjectProperty[];
  authSchemes: AuthScheme[];
  types: Record<TypeId, TypeDefinition>;
}> => {
  const api = await createGetPrunedApiCached(domain)(apiDefinitionId, {
    type: "endpoint",
    endpointId,
  });
  const endpoint = api.endpoints[endpointId];
  if (endpoint == null) {
    notFound();
  }
  const root = await unsafe_getFullRoot(domain);
  return {
    endpoint,
    nodes: FernNavigation.NodeCollector.collect(root)
      .getNodesInOrder()
      .filter(FernNavigation.hasMetadata)
      .filter(
        (node): node is FernNavigation.EndpointNode =>
          node.type === "endpoint" &&
          node.apiDefinitionId === api.id &&
          node.endpointId === endpoint.id
      ),
    globalHeaders: api.globalHeaders ?? [],
    authSchemes:
      endpoint.auth?.map((id) => api.auths[id]).filter(isNonNullish) ?? [],
    types: api.types,
  };
};

const getEndpointByLocator = async (
  domain: string,
  method: HttpMethod,
  path: string,
  example?: string
): Promise<{
  apiDefinitionId: ApiDefinition.ApiDefinitionId;
  endpoint: ApiDefinition.EndpointDefinition;
  slugs: Slug[];
}> => {
  const apis = await getAllApisForDomain(domain);
  for (const api of apis) {
    const endpoint = findEndpoint({
      apiDefinition: api,
      method,
      path,
      example,
    });
    if (endpoint != null) {
      const root = await unsafe_getFullRoot(domain);
      const slugs = FernNavigation.NodeCollector.collect(root)
        .getNodesInOrder()
        .filter(FernNavigation.hasMetadata)
        .filter(
          (node) =>
            node.type === "endpoint" &&
            node.apiDefinitionId === api.id &&
            node.endpointId === endpoint.id
        )
        .map((node) => node.slug);
      return {
        apiDefinitionId: api.id,
        endpoint,
        slugs,
      };
    }
  }
  notFound();
};

const unsafe_getFullRoot = async (domain: string) => {
  const response = await loadWithUrl(domain);

  let root: FernNavigation.RootNode | undefined;

  if (response.definition.config.root) {
    root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(
      response.definition.config.root
    );
  } else if (response.definition.config.navigation) {
    const edgeFlags = await cachedGetEdgeFlags(domain);
    root = FernNavigation.utils.toRootNode(
      response,
      edgeFlags.isBatchStreamToggleDisabled,
      edgeFlags.isApiScrollingDisabled
    );
  }

  if (root == null) {
    notFound();
  }

  if ((await cachedGetEdgeFlags(domain)).isApiScrollingDisabled) {
    FernNavigation.traverseBF(root, (node) => {
      if (node.type === "apiReference") {
        node.paginated = true;
        return CONTINUE;
      }
      return SKIP;
    });
  }

  return root;
};

const unsafe_getRootCached = async (domain: string) => {
  return await unstable_cache(
    unsafe_getFullRoot,
    ["unsafe_getRoot", cacheSeed()],
    { tags: [domain, "unsafe_getRoot"] }
  )(domain);
};

const getRoot = async (
  domain: string,
  authState: AuthState,
  authConfig: AuthEdgeConfig | undefined
) => {
  let root = await unsafe_getRootCached(domain);

  if (authConfig) {
    root = pruneWithAuthState(authState, authConfig, root);
  }

  FernNavigation.utils.mutableUpdatePointsTo(root);

  return root;
};

const getRootCached = async (
  domain: string,
  authState: AuthState,
  authConfig: AuthEdgeConfig | undefined
) => {
  return await unstable_cache(getRoot, [domain, cacheSeed()], {
    tags: [domain, "getRoot"],
  })(domain, authState, authConfig);
};

const getNavigationNode = async (
  domain: string,
  id: string,
  authState: AuthState,
  authConfig: AuthEdgeConfig | undefined
) => {
  const root = await getRootCached(domain, authState, authConfig);
  const collector = FernNavigation.NodeCollector.collect(root);
  const node = collector.get(FernNavigation.NodeId(id));
  if (node == null) {
    notFound();
  }
  return node;
};

const getConfig = async (domain: string) => {
  const response = await loadWithUrl(domain);
  const { navigation, root, ...config } = response.definition.config;
  return config;
};

const getPage = async (domain: string, pageId: string) => {
  const response = await loadWithUrl(domain);
  const page = response.definition.pages[pageId as PageId];
  if (page == null) {
    notFound();
  }
  return {
    filename: pageId,
    markdown: page.markdown,
    editThisPageUrl: page.editThisPageUrl,
  };
};

const getMdxBundlerFiles = async (domain: string) => {
  const response = await loadWithUrl(domain);
  return response.definition.jsFiles ?? {};
};

const getColors = async (domain: string) => {
  const [config, files] = await Promise.all([
    getConfig(domain),
    getFiles(domain),
  ]);
  if (!config) {
    return { light: undefined, dark: undefined };
  }

  if (!config.colorsV3) {
    return { light: undefined, dark: undefined };
  }

  const light =
    config.colorsV3.type === "light"
      ? config.colorsV3
      : config.colorsV3.type === "darkAndLight"
        ? config.colorsV3.light
        : undefined;

  const dark =
    config.colorsV3.type === "dark"
      ? config.colorsV3
      : config.colorsV3.type === "darkAndLight"
        ? config.colorsV3.dark
        : undefined;

  return {
    light: light
      ? {
          logo: light.logo ? files[light.logo] : undefined,
          backgroundImage: light.backgroundImage
            ? files[light.backgroundImage]
            : undefined,
          ...generateFernColorPalette({
            appearance: "light",
            background: toOklch(light.background),
            accent: toOklch(light.accentPrimary),
            border: toOklch(light.border),
            sidebarBackground: toOklch(light.sidebarBackground),
            headerBackground: toOklch(light.headerBackground),
            cardBackground: toOklch(light.cardBackground),
          }),
          backgroundGradient: light.background.type === "gradient",
        }
      : undefined,
    dark: dark
      ? {
          logo: dark.logo ? files[dark.logo] : undefined,
          backgroundImage: dark.backgroundImage
            ? files[dark.backgroundImage]
            : undefined,
          ...generateFernColorPalette({
            appearance: "dark",
            background: toOklch(dark.background),
            accent: toOklch(dark.accentPrimary),
            border: toOklch(dark.border),
            sidebarBackground: toOklch(dark.sidebarBackground),
            headerBackground: toOklch(dark.headerBackground),
            cardBackground: toOklch(dark.cardBackground),
          }),
          backgroundGradient: dark.background.type === "gradient",
        }
      : undefined,
  };
};

const getFonts = async (domain: string) => {
  const response = await loadWithUrl(domain);
  return generateFonts(
    response.definition.config.typographyV2,
    await getFiles(domain)
  );
};

const getLayout = async (domain: string) => {
  const config = await getConfig(domain);
  if (!config) {
    notFound();
  }

  const logoHeight = config.logoHeight ?? DEFAULT_LOGO_HEIGHT;
  const sidebarWidth = toPx(config.layout?.sidebarWidth) ?? 288;
  const pageWidth =
    config.layout?.pageWidth?.type === "full"
      ? undefined
      : (toPx(config.layout?.pageWidth) ?? 1_408);
  const headerHeight = toPx(config.layout?.headerHeight) ?? 64;
  const contentWidth = toPx(config.layout?.contentWidth) ?? 640;
  const tabsPlacement = config.layout?.tabsPlacement ?? "SIDEBAR";
  const searchbarPlacement = config.layout?.searchbarPlacement ?? "HEADER";
  return {
    logoHeight,
    sidebarWidth,
    headerHeight,
    pageWidth,
    contentWidth,
    tabsPlacement,
    searchbarPlacement,
    isHeaderDisabled: config.layout?.disableHeader ?? false,
  };
};

const getAuthConfig = getAuthEdgeConfig;

/**
 * The "use cache" tags help us speed up rendering specific parts of the page that are static.
 * It has a hard-limit of 2MB which is why we cannot use it to cache the entire response.
 * The expectation is that moving forward, we'll update the underlying API to be more cache-friendly
 * in a piece-meal fashion, and eventually remove all use of loadWithUrl.
 */
export const createCachedDocsLoader = async (
  host: string,
  domain: string,
  fern_token?: string
): Promise<DocsLoader> => {
  const authConfig = getAuthConfig(domain);
  const metadata = getDocsUrlMetadata(withoutStaging(domain));

  const getAuthState = cache(async (pathname?: string) => {
    const { getAuthState } = await createGetAuthState(
      host,
      domain,
      fern_token,
      await authConfig,
      await metadata
    );

    return await getAuthState(pathname);
  });

  return {
    domain,
    fern_token,
    getAuthConfig: () => authConfig,
    getBaseUrl: cache(
      unstable_cache(() => getBaseUrl(domain), [domain, cacheSeed()], {
        tags: [domain, "getBaseUrl"],
      })
    ),
    getMetadata: () => metadata,
    getFiles: cache(
      unstable_cache(() => getFiles(domain), [domain, cacheSeed()], {
        tags: [domain, "files"],
      })
    ),
    getMdxBundlerFiles: cache(
      unstable_cache(() => getMdxBundlerFiles(domain), [domain, cacheSeed()], {
        tags: [domain, "mdxBundlerFiles"],
      })
    ),
    getApi: cache(createGetApiCached(domain)),
    getPrunedApi: cache(createGetPrunedApiCached(domain)),
    getEndpointById: cache(
      unstable_cache(
        (apiDefinitionId: string, endpointId: EndpointId) =>
          getEndpointById(domain, apiDefinitionId, endpointId),
        [domain, cacheSeed()],
        { tags: [domain, "endpointById"] }
      )
    ),
    getEndpointByLocator: cache(
      unstable_cache(
        (method: HttpMethod, path: string, example?: string) =>
          getEndpointByLocator(domain, method, path, example),
        [domain, cacheSeed()],
        { tags: [domain, "endpointByLocator"] }
      )
    ),
    getRoot: cache(async () =>
      getRootCached(domain, await getAuthState(), await authConfig)
    ),
    getNavigationNode: cache(async (id: string) =>
      getNavigationNode(domain, id, await getAuthState(), await authConfig)
    ),
    unsafe_getFullRoot: cache(() => unsafe_getRootCached(domain)),
    getConfig: cache(
      unstable_cache(() => getConfig(domain), [domain, cacheSeed()], {
        tags: [domain, "getConfig"],
      })
    ),
    getPage: cache(
      unstable_cache(
        (pageId: string) => getPage(domain, pageId),
        [domain, cacheSeed()],
        { tags: [domain, "getPage"] }
      )
    ),
    getColors: cache(
      unstable_cache(() => getColors(domain), [domain, cacheSeed()], {
        tags: [domain, "getColors"],
      })
    ),
    getLayout: cache(
      unstable_cache(() => getLayout(domain), [domain, cacheSeed()], {
        tags: [domain, "getLayout"],
      })
    ),
    getFonts: cache(
      unstable_cache(() => getFonts(domain), [domain, cacheSeed()], {
        tags: [domain, "getFonts"],
      })
    ),
    getAuthState,
    getEdgeFlags: cache(
      unstable_cache(() => cachedGetEdgeFlags(domain), [domain, cacheSeed()], {
        tags: [domain, "getEdgeFlags"],
      })
    ),
  };
};

function toOklch(color: object | undefined): string | undefined {
  if (!color || !isPlainObject(color)) {
    return undefined;
  }
  if (
    "r" in color &&
    typeof color.r === "number" &&
    "g" in color &&
    typeof color.g === "number" &&
    "b" in color &&
    typeof color.b === "number"
  ) {
    if ("a" in color && typeof color.a === "number") {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }
  return undefined;
}

export function toPx(
  config:
    | { type: "px"; value: number }
    | { type: "rem"; value: number }
    | undefined
): number | undefined {
  if (!config) {
    return undefined;
  }
  if (config.type === "px") {
    return config.value;
  }
  return config.value * 16;
}
