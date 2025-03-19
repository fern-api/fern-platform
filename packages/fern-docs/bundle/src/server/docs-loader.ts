import "server-only";

import { unstable_cache, unstable_cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { cache } from "react";

import { kv } from "@vercel/kv";
import { mapValues } from "es-toolkit/object";
import { AsyncOrSync, UnreachableCaseError } from "ts-essentials";
import { z } from "zod";

import {
  ApiDefinition,
  DocsV1Read,
  DocsV2Read,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import {
  ApiDefinitionV1ToLatest,
  AuthScheme,
  EnvironmentId,
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
  DEFAULT_CONTENT_WIDTH,
  DEFAULT_GUTTER_WIDTH,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_LOGO_HEIGHT,
  DEFAULT_PAGE_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  EdgeFlags,
  FERN_DOCS_ORIGINS,
  withoutStaging,
} from "@fern-docs/utils";

import { findEndpoint } from "../components/util/processRequestSnippetComponents";
import { AuthState, createGetAuthState } from "./auth/getAuthState";
import { cacheSeed } from "./cache-seed";
import { generateFernColorPalette } from "./generateFernColors";
import { FernFonts, generateFonts } from "./generateFonts";
import { getDocsUrlMetadata } from "./getDocsUrlMetadata";
import { loadWithUrl as uncachedLoadWithUrl } from "./loadWithUrl";
import { postToEngineeringNotifs } from "./slack";
import { FernColorTheme, FernLayoutConfig, FileData } from "./types";
import { cleanBasePath } from "./utils/clean-base-path";
import { pruneWithAuthState } from "./withRbac";

const loadWithUrl = uncachedLoadWithUrl;

const DocsMetadataSchema = z.object({
  domain: z.string(),
  basePath: z.string(),
  url: z.string(),
  org: z.string(),
  isPreview: z.boolean(),
});

type DocsMetadata = z.infer<typeof DocsMetadataSchema>;

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

  getBaseUrl: () => Promise<string>;
}

function assertDocsDomain(domain: string) {
  if (FERN_DOCS_ORIGINS.includes(domain) || domain.endsWith(".vercel.app")) {
    notFound();
  }
}

function kvSet(domain: string, key: string, value: unknown) {
  after(async () => {
    try {
      await kv.hset(domain, { [key]: value });
    } catch (error) {
      console.warn(`Failed to set kv key ${key}: ${value}`, error);
    }
  });
}

const cachedGetEdgeFlags = cache(async (domain: string) => {
  return await getEdgeFlags(domain);
});

export const getMetadataFromResponse = async (
  domain: string,
  responsePromise: AsyncOrSync<DocsV2Read.LoadDocsForUrlResponse>
): Promise<DocsMetadata> => {
  assertDocsDomain(domain);

  const [response, docsUrlMetadata] = await Promise.all([
    responsePromise,
    getDocsUrlMetadata(domain),
  ]);
  return {
    domain: response.baseUrl.domain,
    basePath: cleanBasePath(response.baseUrl.basePath),
    url: docsUrlMetadata.url,
    org: docsUrlMetadata.org,
    isPreview: docsUrlMetadata.isPreview,
  };
};

export const getMetadata = cache(
  async (domain: string): Promise<DocsMetadata> => {
    "use cache";

    unstable_cacheTag(domain, "getMetadata");

    assertDocsDomain(domain);

    try {
      const cached = DocsMetadataSchema.safeParse(
        await kv.hget<DocsMetadata>(domain, "metadata")
      );
      if (cached.success) {
        console.log("[getMetadata] cache hit:", cached.data);
        return cached.data;
      }
    } catch (error) {
      console.warn(
        `Failed to get metadata for ${domain} from kv, fallback to uncached`,
        error
      );
    }
    try {
      const metadata = await getMetadataFromResponse(
        domain,
        loadWithUrl(domain)
      );
      kvSet(domain, "metadata", metadata);
      console.log("[getMetadata] cache miss:", metadata);
      return metadata;
    } catch (error) {
      postToEngineeringNotifs(
        `:rotating_light: Failed to get metadata for ${domain} with the following error: ${String(error)}`
      );
      throw error;
    }
  }
);

const getFiles = cache(
  async (domain: string): Promise<Record<string, FileData>> => {
    "use cache";

    unstable_cacheTag(domain, "getFiles");

    try {
      const cached = await kv.hget<Record<string, FileData>>(domain, "files");
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn(
        `Failed to get files for ${domain}, fallback to uncached`,
        error
      );
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
    kvSet(domain, "files", files);
    return files;
  }
);

// the api reference may be too large to cache, so we don't cache it in the KV store
const getApi = async (domain: string, id: string) => {
  "use cache";

  unstable_cacheTag(domain, "getApi", id);

  const response = await loadWithUrl(domain);
  const latest = response.definition.apisV2[ApiDefinitionId(id)];
  if (latest != null) {
    return latest;
  }
  const v1 = response.definition.apis[ApiDefinitionId(id)];
  if (v1 == null) {
    console.debug("Could not get API with ID", ApiDefinitionId(id));
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
          const key = `api:${id}:${createEndpointCacheKey(nodes[0])}`;
          const cached = await kv.hget<ApiDefinition.ApiDefinition>(
            domain,
            key
          );
          if (cached != null) {
            return await backfillSnippets(cached, await flagsPromise);
          }
        }
      } catch (error) {
        console.warn(
          `Failed to get pruned api for ${domain}:${id}, fallback to uncached`,
          error
        );
      }

      const api = await getApi(domain, id);
      const pruned = prune(api, ...nodes);

      for (const endpointK of Object.keys(pruned.endpoints)) {
        if (
          pruned.endpoints[EndpointId(endpointK)]?.environments?.length === 0
        ) {
          console.debug(
            `${endpointK} has empty environments, adding default URL.`
          );
          pruned.endpoints[EndpointId(endpointK)]?.environments?.push({
            id: "Default" as EnvironmentId,
            baseUrl: "https://host.com",
          });
        }
      }

      // if there is only one node, and it's an endpoint, try to cache the result
      if (nodes.length === 1 && nodes[0]) {
        const key = `api:${id}:${createEndpointCacheKey(nodes[0])}`;
        kvSet(domain, key, pruned);
      }

      return backfillSnippets(pruned, await flagsPromise);
    },
    [domain, cacheSeed()],
    { tags: [domain, "api"] }
  );

export function createEndpointCacheKey(pruneType: PruningNodeType) {
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
  "use cache";

  unstable_cacheTag(domain, "getEndpointById", apiDefinitionId, endpointId);

  const api = await createGetPrunedApiCached(domain)(apiDefinitionId, {
    type: "endpoint",
    endpointId,
  });
  const endpoint = api.endpoints[endpointId];
  if (endpoint == null) {
    console.debug("Could not find endpoint with ID", endpointId);
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

  console.debug(`Could not find endpoint ${method} ${path}`);
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
    const cached = await kv.hget<FernNavigation.RootNode>(domain, "root");
    if (cached != null) {
      return cached;
    }
  } catch (error) {
    console.warn(
      `Failed to get full root for ${domain}, fallback to uncached`,
      error
    );
  }
  const response = await loadWithUrl(domain);
  const root = convertResponseToRootNode(
    response,
    await cachedGetEdgeFlags(domain)
  );
  if (root == null) {
    console.debug("Could not find root node for domain", domain);
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
      console.debug(`Could not find node ${id} for domain ${domain}`);
      notFound();
    }
    return node;
  }
);

const getConfig = cache(async (domain: string) => {
  try {
    const cached = await kv.hget<
      Omit<DocsV1Read.DocsDefinition["config"], "navigation" | "root">
    >(domain, "config");
    if (cached != null) {
      return cached;
    }
  } catch (error) {
    console.warn(
      `Failed to get config for ${domain}, fallback to uncached`,
      error
    );
  }
  const response = await loadWithUrl(domain);
  const { navigation, root, ...config } = response.definition.config;
  kvSet(domain, "config", config);
  return config;
});

const getPage = cache(async (domain: string, pageId: string) => {
  try {
    const page = await kv.hget<DocsV1Read.PageContent>(
      domain,
      `page:${pageId}`
    );
    if (page != null && isPlainObject(page) && "markdown" in page) {
      return {
        filename: pageId,
        markdown: page.markdown,
        editThisPageUrl: page.editThisPageUrl,
      };
    }
  } catch (error) {
    console.warn(
      `Failed to get page for ${domain}:${pageId}, fallback to uncached`,
      error
    );
  }
  const response = await loadWithUrl(domain);
  const page = response.definition.pages[pageId as PageId];
  if (page == null) {
    console.debug(`Could not find page with ID ${pageId}`);
    notFound();
  }
  kvSet(domain, `page:${pageId}`, page);
  return {
    filename: pageId,
    markdown: page.markdown,
    editThisPageUrl: page.editThisPageUrl,
  };
});

const getMdxBundlerFiles = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain, "getMdxBundlerFiles");

  try {
    const cached = await kv.hget<Record<string, string>>(
      domain,
      "mdx-bundler-files"
    );
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn(
      `Failed to get mdx bundler files for ${domain}, fallback to uncached`,
      error
    );
  }
  const response = await loadWithUrl(domain);
  const files = response.definition.jsFiles ?? {};
  kvSet(domain, "mdx-bundler-files", files);
  return files;
});

const getColors = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain, "getColors");

  try {
    const cached = await kv.hget<{
      light: FernColorTheme | undefined;
      dark: FernColorTheme | undefined;
    }>(domain, "colors");
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn(
      `Failed to get colors for ${domain}, fallback to uncached`,
      error
    );
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
  kvSet(domain, "colors", colors);
  return colors;
});

const getFonts = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain, "getFonts");

  try {
    const cached = await kv.hget<FernFonts>(domain, "fonts");
    if (cached != null) {
      return cached;
    }
  } catch (error) {
    console.warn(
      `Failed to get fonts for ${domain}, fallback to uncached`,
      error
    );
  }
  const response = await loadWithUrl(domain);
  const fonts = generateFonts(
    response.definition.config.typographyV2,
    await getFiles(domain)
  );
  kvSet(domain, "fonts", fonts);
  return fonts;
});

const getLayout = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain, "getLayout");

  const config = await getConfig(domain);
  if (!config) {
    console.debug("Could not find config for domain", domain);
    notFound();
  }

  const logoHeight = config.logoHeight ?? DEFAULT_LOGO_HEIGHT;
  const sidebarWidth =
    toPx(config.layout?.sidebarWidth) ?? DEFAULT_SIDEBAR_WIDTH;
  const contentWidth =
    toPx(config.layout?.contentWidth) ?? DEFAULT_CONTENT_WIDTH;
  const pageWidth =
    config.layout?.pageWidth?.type === "full"
      ? undefined
      : (toPx(config.layout?.pageWidth) ??
        calcDefaultPageWidth(sidebarWidth, contentWidth));
  const headerHeight =
    toPx(config.layout?.headerHeight) ?? DEFAULT_HEADER_HEIGHT;
  const tabsPlacement = config.layout?.disableHeader
    ? "SIDEBAR"
    : (config.layout?.tabsPlacement ?? defaultTabsPlacement(domain));
  const searchbarPlacement = config.layout?.disableHeader
    ? "SIDEBAR"
    : (config.layout?.searchbarPlacement ?? defaultSearchbarPlacement(domain));
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

function defaultTabsPlacement(domain: string) {
  if (domain.includes("cohere")) {
    return "HEADER";
  }
  return "SIDEBAR";
}

function defaultSearchbarPlacement(domain: string) {
  if (domain.includes("cohere")) {
    return "HEADER_TABS";
  }
  return "HEADER";
}

/**
 * The default page width should be at least 1408px (88rem), and should be able to fit 1 content + 2 sidebars
 *
 * The default width for content is 40rem, and the default width for a sidebar is 18rem,
 * so the 2x sidebar + 1x content + 2x gutter = 76rem (1280px),
 * which happens to be the `xl` breakpoint in tailwind as well as the resolution of a 13 inch macbook air.
 *
 * The reason the page width is bumped up to 88rem instead of 76rem is to create a little more breathing room between
 * content and sidebars on a larger screen (such as a 16 inch macbook pro). This is a 8rem (128px) true gutter between the content and sidebars.
 *
 * The 16 inch macbook pro has 1728px (108rem) of width, which results in a 10rem (160px) gutter _around_ the entire page.
 *
 */
function calcDefaultPageWidth(sidebarWidth: number, contentWidth: number) {
  return Math.max(
    DEFAULT_PAGE_WIDTH,
    sidebarWidth * 2 + contentWidth + DEFAULT_GUTTER_WIDTH
  );
}

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
  assertDocsDomain(domain);

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
    getBaseUrl: async () => {
      const m = await metadata;
      return `https://${m.domain}${m.basePath}`;
    },
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

export function createPruneKey(
  node: FernNavigation.NavigationNodeApiLeaf
): PruningNodeType {
  switch (node.type) {
    case "endpoint":
      return {
        type: "endpoint",
        endpointId: node.endpointId,
      };
    case "webSocket":
      return {
        type: "webSocket",
        webSocketId: node.webSocketId,
      };
    case "webhook":
      return {
        type: "webhook",
        webhookId: node.webhookId,
      };
    default:
      throw new Error(`Unknown node type: ${node}`);
  }
}
