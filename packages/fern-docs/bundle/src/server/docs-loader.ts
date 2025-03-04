import "server-only";

import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";

import { kv } from "@vercel/kv";
import { mapValues } from "es-toolkit/object";
import { AsyncOrSync, UnreachableCaseError } from "ts-essentials";

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

interface DocsMetadata {
  domain: string;
  basePath: string | undefined;
  url: string;
  org: string;
  isPreview: boolean;
}

export interface DocsLoader {
  domain: string;
  fern_token: string | undefined;

  getAuthConfig: () => Promise<AuthEdgeConfig | undefined>;

  /**
   * @returns the metadata for the given url, including the domain, base path, url, org, and isPreview
   */
  getMetadata: () => Promise<DocsMetadata>;

  /**
   * @returns a map of file names to their contents
   */
  getFiles: () => Promise<Record<string, FileData>>;

  /**
   * @returns a map of mdx bundler files
   */
  getMdxBundlerFiles: () => Promise<Record<string, string>>;

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

export const getMetadataFromResponse = async (
  domain: string,
  responsePromise: AsyncOrSync<DocsV2Read.LoadDocsForUrlResponse>
): Promise<DocsMetadata> => {
  const [response, docsUrlMetadata] = await Promise.all([
    responsePromise,
    getDocsUrlMetadata(domain),
  ]);
  return {
    domain: response.baseUrl.domain,
    basePath: response.baseUrl.basePath,
    url: docsUrlMetadata.url,
    org: docsUrlMetadata.org,
    isPreview: docsUrlMetadata.isPreview,
  };
};

const getMetadata = cache(async (domain: string): Promise<DocsMetadata> => {
  try {
    const cached = await kv.get<DocsMetadata>(`${domain}:metadata`);
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
  const metadata = getMetadataFromResponse(domain, loadWithUrl(domain));
  try {
    await kv.set(`${domain}:metadata`, metadata);
  } catch {
    // do nothing
  }
  return metadata;
});

const getFiles = cache(
  async (domain: string): Promise<Record<string, FileData>> => {
    try {
      const cached = await kv.get<Record<string, FileData>>(`${domain}:files`);
      if (cached != null) {
        return cached;
      }
    } catch {
      // do nothing
    }
    const response = await loadWithUrl(domain);
    const files = mapValues(response.definition.filesV2, (file) => {
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
    try {
      await kv.set(`${domain}:files`, files);
    } catch {
      // do nothing
    }
    return files;
  }
);

// the api reference may be too large to cache, so we don't cache it in the KV store
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

const createGetPrunedApiCached = (domain: string) =>
  unstable_cache(
    async (
      id: string,
      ...nodes: PruningNodeType[]
    ): Promise<ApiDefinition.ApiDefinition> => {
      const flagsPromise = cachedGetEdgeFlags(domain);

      // if there is only one node, and it's an endpoint, try to load from cache
      try {
        if (nodes.length === 1 && nodes[0]) {
          const key = `${domain}:api:${id}:${createEndpointCacheKey(nodes[0])}`;
          const cached = await kv.get<ApiDefinition.ApiDefinition>(key);
          if (cached != null) {
            return await backfillSnippets(cached, await flagsPromise);
          }
        }
      } catch {
        // do nothing
      }

      const api = await getApi(domain, id);
      const pruned = prune(api, ...nodes);

      // if there is only one node, and it's an endpoint, try to cache the result
      try {
        if (nodes.length === 1 && nodes[0]) {
          const key = `${domain}:api:${id}:${createEndpointCacheKey(nodes[0])}`;
          await kv.set(key, pruned);
        }
      } catch {
        // do nothing
      }

      return backfillSnippets(pruned, await flagsPromise);
    },
    [domain, cacheSeed()],
    { tags: [domain, "api"] }
  );

function createEndpointCacheKey(pruneType: PruningNodeType) {
  switch (pruneType.type) {
    case "endpoint":
      return `endpoint:${pruneType.endpointId}`;
    case "webSocket":
      return `websocket:${pruneType.webSocketId}`;
    case "webhook":
      return `webhook:${pruneType.webhookId}`;
    default:
      throw new UnreachableCaseError(pruneType);
  }
}

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

export function convertResponseToRootNode(
  response: DocsV2Read.LoadDocsForUrlResponse,
  edgeFlags: EdgeFlags
) {
  let root: FernNavigation.RootNode | undefined;

  if (response.definition.config.root) {
    root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(
      response.definition.config.root
    );
  } else if (response.definition.config.navigation) {
    root = FernNavigation.utils.toRootNode(
      response,
      edgeFlags.isBatchStreamToggleDisabled,
      edgeFlags.isApiScrollingDisabled
    );
  }

  if (root && edgeFlags.isApiScrollingDisabled) {
    FernNavigation.traverseBF(root, (node) => {
      if (node.type === "apiReference") {
        node.paginated = true;
        return CONTINUE;
      }
      return SKIP;
    });
  }

  return root;
}

const unsafe_getFullRoot = async (domain: string) => {
  try {
    const cached = await kv.get<FernNavigation.RootNode>(`${domain}:root`);
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
  const response = await loadWithUrl(domain);
  const root = convertResponseToRootNode(
    response,
    await cachedGetEdgeFlags(domain)
  );
  if (root == null) {
    notFound();
  }
  return root;
};

const unsafe_getRootCached = cache(async (domain: string) => {
  return await unstable_cache(
    unsafe_getFullRoot,
    ["unsafe_getRoot", cacheSeed()],
    { tags: [domain, "unsafe_getRoot"] }
  )(domain);
});

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

const getRootCached = cache(
  async (
    domain: string,
    authState: AuthState,
    authConfig: AuthEdgeConfig | undefined
  ) => {
    return await unstable_cache(getRoot, [domain, cacheSeed()], {
      tags: [domain, "getRoot"],
    })(domain, authState, authConfig);
  }
);

const getNavigationNode = cache(
  async (
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
  }
);

const getConfig = cache(async (domain: string) => {
  try {
    const cached = await kv.get<
      Omit<DocsV1Read.DocsDefinition["config"], "navigation" | "root">
    >(`${domain}:config`);
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
  const response = await loadWithUrl(domain);
  const { navigation, root, ...config } = response.definition.config;
  try {
    await kv.set(`${domain}:config`, config);
  } catch {
    // do nothing
  }
  return config;
});

const getPage = cache(async (domain: string, pageId: string) => {
  try {
    const page = await kv.get<DocsV1Read.PageContent>(
      `${domain}:page:${pageId}`
    );
    if (page != null && isPlainObject(page) && "markdown" in page) {
      return {
        filename: pageId,
        markdown: page.markdown,
        editThisPageUrl: page.editThisPageUrl,
      };
    }
  } catch {
    // do nothing
  }
  const response = await loadWithUrl(domain);
  const page = response.definition.pages[pageId as PageId];
  if (page == null) {
    notFound();
  }
  try {
    await kv.set(`${domain}:page:${pageId}`, page);
  } catch {
    // do nothing
  }
  return {
    filename: pageId,
    markdown: page.markdown,
    editThisPageUrl: page.editThisPageUrl,
  };
});

const getMdxBundlerFiles = cache(async (domain: string) => {
  try {
    const cached = await kv.get<Record<string, string>>(
      `${domain}:mdx-bundler-files`
    );
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
  const response = await loadWithUrl(domain);
  const files = response.definition.jsFiles ?? {};
  try {
    await kv.set(`${domain}:mdx-bundler-files`, files);
  } catch {
    // do nothing
  }
  return files;
});

const getColors = cache(async (domain: string) => {
  try {
    const cached = await kv.get<{
      light: FernColorTheme | undefined;
      dark: FernColorTheme | undefined;
    }>(`${domain}:colors`);
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
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

  const colors = {
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
  try {
    await kv.set(`${domain}:colors`, colors);
  } catch {
    // do nothing
  }
  return colors;
});

const getFonts = cache(async (domain: string) => {
  try {
    const cached = await kv.get<FernFonts>(`${domain}:fonts`);
    if (cached != null) {
      return cached;
    }
  } catch {
    // do nothing
  }
  const response = await loadWithUrl(domain);
  const fonts = generateFonts(
    response.definition.config.typographyV2,
    await getFiles(domain)
  );
  try {
    await kv.set(`${domain}:fonts`, fonts);
  } catch {
    // do nothing
  }
  return fonts;
});

const getLayout = cache(async (domain: string) => {
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
});

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
  const metadata = getMetadata(withoutStaging(domain));

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
    getMetadata: () => metadata,
    getFiles: () => getFiles(domain),
    getMdxBundlerFiles: () => getMdxBundlerFiles(domain),
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
    getRoot: async () =>
      getRootCached(domain, await getAuthState(), await authConfig),
    getNavigationNode: async (id: string) =>
      getNavigationNode(domain, id, await getAuthState(), await authConfig),
    unsafe_getFullRoot: () => unsafe_getRootCached(domain),
    getConfig: () => getConfig(domain),
    getPage: (pageId) => getPage(domain, pageId),
    getColors: () => getColors(domain),
    getLayout: () => getLayout(domain),
    getFonts: () => getFonts(domain),
    getAuthState,
    getEdgeFlags: () => cachedGetEdgeFlags(domain),
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
