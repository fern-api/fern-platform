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
import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import { ApiDefinitionId, PageId } from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isPlainObject } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig } from "@fern-docs/auth";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { DEFAULT_LOGO_HEIGHT, EdgeFlags } from "@fern-docs/utils";

import { AuthState, createGetAuthState } from "./auth/getAuthState";
import { cacheSeed } from "./cache-seed";
import { getDocsUrlMetadata } from "./getDocsUrlMetadata";
import { loadWithUrl as uncachedLoadWithUrl } from "./loadWithUrl";
import { ColorsThemeConfig, FileData, RgbaColor } from "./types";
import { pruneWithAuthState } from "./withRbac";

const loadWithUrl = cache(uncachedLoadWithUrl);

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
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  }>;

  getLayout: () => Promise<{
    logoHeight: number;
    sidebarWidth: number;
    headerHeight: number;
    pageWidth: number | undefined;
    contentWidth: number;
    tabsPlacement: "SIDEBAR" | "HEADER";
    searchbarPlacement: "SIDEBAR" | "HEADER" | "HEADER_TABS";
  }>;

  getAuthState: (pathname?: string) => Promise<AuthState>;

  getEdgeFlags: () => Promise<EdgeFlags>;
}

const cachedGetEdgeFlags = cache(async (domain: string) => {
  return await getEdgeFlags(domain);
});

const getBaseUrl = cache(
  async (domain: string): Promise<DocsV2Read.BaseUrl> => {
    const response = await loadWithUrl(domain);
    return {
      domain: response.baseUrl.domain,
      basePath: response.baseUrl.basePath,
    };
  }
);

const getFiles = cache(
  async (domain: string): Promise<Record<string, FileData>> => {
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
  }
);

const getApi = cache(
  async (domain: string, id: string): Promise<ApiDefinition.ApiDefinition> => {
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
  }
);

const unsafe_getFullRoot = cache(async (domain: string) => {
  const response = await loadWithUrl(domain);
  const v1 = response.definition.config.root;

  if (!v1) {
    notFound();
  }

  const root =
    FernNavigation.migrate.FernNavigationV1ToLatest.create().root(v1);

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
});

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

const getRootCached = async (
  domain: string,
  authState: AuthState,
  authConfig: AuthEdgeConfig | undefined
) => {
  return await unstable_cache(getRoot, [cacheSeed()], {
    tags: [domain],
  })(domain, authState, authConfig);
};

const getNavigationNode = async (
  domain: string,
  id: string,
  authState: AuthState,
  authConfig: AuthEdgeConfig | undefined
) => {
  const root = await getRoot(domain, authState, authConfig);
  const collector = FernNavigation.NodeCollector.collect(root);
  const node = collector.get(FernNavigation.NodeId(id));
  if (node == null) {
    notFound();
  }
  return node;
};

const getConfig = cache(async (domain: string) => {
  const response = await loadWithUrl(domain);
  const { navigation, root, ...config } = response.definition.config;
  return config;
});

const getPage = cache(async (domain: string, pageId: string) => {
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
});

const getMdxBundlerFiles = cache(async (domain: string) => {
  const response = await loadWithUrl(domain);
  return response.definition.jsFiles ?? {};
});

const getColors = cache(async (domain: string) => {
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
          accentPrimary: toRgbaColor(light.accentPrimary),
          background: toRgbaColor(light.background),
          border: toRgbaColor(light.border),
          sidebarBackground: toRgbaColor(light.sidebarBackground),
          headerBackground: toRgbaColor(light.headerBackground),
          cardBackground: toRgbaColor(light.cardBackground),
        }
      : undefined,
    dark: dark
      ? {
          logo: dark.logo ? files[dark.logo] : undefined,
          backgroundImage: dark.backgroundImage
            ? files[dark.backgroundImage]
            : undefined,
          accentPrimary: toRgbaColor(dark.accentPrimary),
          background: toRgbaColor(dark.background),
          border: toRgbaColor(dark.border),
          sidebarBackground: toRgbaColor(dark.sidebarBackground),
          headerBackground: toRgbaColor(dark.headerBackground),
          cardBackground: toRgbaColor(dark.cardBackground),
        }
      : undefined,
  };
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
  const contentWidth = toPx(config.layout?.contentWidth) ?? 704;
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
  };
});

const getAuthConfig = cache(getAuthEdgeConfig);

/**
 * The "use cache" tags help us speed up rendering specific parts of the page that are static.
 * It has a hard-limit of 2MB which is why we cannot use it to cache the entire response.
 * The expectation is that moving forward, we'll update the underlying API to be more cache-friendly
 * in a piece-meal fashion, and eventually remove all use of loadWithUrl.
 */
export const createCachedDocsLoader = async (
  domain: string,
  fern_token?: string
): Promise<DocsLoader> => {
  const authConfig = getAuthConfig(domain);
  const metadata = getDocsUrlMetadata(domain);

  const getAuthState = async (pathname?: string) => {
    const { getAuthState } = await createGetAuthState(
      domain,
      fern_token,
      await authConfig,
      await metadata
    );

    return await getAuthState(pathname);
  };

  return {
    domain,
    fern_token,
    getAuthConfig: () => authConfig,
    getBaseUrl: unstable_cache(
      () => getBaseUrl(domain),
      [domain, cacheSeed()],
      {
        tags: [domain, "getBaseUrl"],
      }
    ),
    getMetadata: () => metadata,
    getFiles: unstable_cache(() => getFiles(domain), [domain, cacheSeed()], {
      tags: [domain, "files"],
    }),
    getMdxBundlerFiles: unstable_cache(
      () => getMdxBundlerFiles(domain),
      [domain, cacheSeed()],
      { tags: [domain, "mdxBundlerFiles"] }
    ),
    getApi: unstable_cache(
      (id: string) => getApi(domain, id),
      [domain, cacheSeed()],
      { tags: [domain, "api"] }
    ),
    getRoot: async () =>
      getRootCached(domain, await getAuthState(), await authConfig),
    getNavigationNode: async (id: string) =>
      getNavigationNode(domain, id, await getAuthState(), await authConfig),
    unsafe_getFullRoot: () => unsafe_getRootCached(domain),
    getConfig: unstable_cache(() => getConfig(domain), [domain, cacheSeed()], {
      tags: [domain, "getConfig"],
    }),
    getPage: unstable_cache(
      (pageId: string) => getPage(domain, pageId),
      [domain, cacheSeed()],
      { tags: [domain, "getPage"] }
    ),
    getColors: unstable_cache(() => getColors(domain), [domain, cacheSeed()], {
      tags: [domain, "getColors"],
    }),
    getLayout: unstable_cache(() => getLayout(domain), [domain, cacheSeed()], {
      tags: [domain, "getLayout"],
    }),
    getAuthState,
    getEdgeFlags: unstable_cache(
      () => cachedGetEdgeFlags(domain),
      [domain, cacheSeed()],
      { tags: [domain, "getEdgeFlags"] }
    ),
  };
};

function toRgbaColor(color: RgbaColor): RgbaColor;
function toRgbaColor(color: object | undefined): RgbaColor | undefined;
function toRgbaColor(color: object | undefined): RgbaColor | undefined {
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
    return {
      r: color.r,
      g: color.g,
      b: color.b,
      a: "a" in color && typeof color.a === "number" ? color.a : undefined,
    };
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
