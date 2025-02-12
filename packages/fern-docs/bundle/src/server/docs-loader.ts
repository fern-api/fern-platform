import "server-only";

import { unstable_cacheLife, unstable_cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";

import { mapValues } from "es-toolkit/object";
import { UnreachableCaseError } from "ts-essentials";

import {
  ApiDefinition,
  DocsV1Read,
  DocsV2Read,
  FernDocs,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import { ApiDefinitionId, PageId } from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isPlainObject } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig } from "@fern-docs/auth";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { DEFAULT_LOGO_HEIGHT, EdgeFlags } from "@fern-docs/utils";

import { serializeMdx as uncachedSerializeMdx } from "@/components/mdx/bundler/serialize";
import { FernSerializeMdxOptions } from "@/components/mdx/types";

import { AuthState, createGetAuthState } from "./auth/getAuthState";
import { createFileResolver } from "./file-resolver";
import { loadWithUrl as uncachedLoadWithUrl } from "./loadWithUrl";
import { ColorsThemeConfig, FileData, RgbaColor } from "./types";
import { pruneWithAuthState } from "./withRbac";

const loadWithUrl = cache(uncachedLoadWithUrl);

export interface DocsLoader {
  domain: string;
  fern_token: string | undefined;
  authConfig: AuthEdgeConfig | undefined;

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
  getFiles: () => Promise<Record<string, FileData>>;

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
    markdown: string;
    editThisPageUrl?: string;
  }>;

  /**
   * @returns the serialized page for the given page id
   */
  getSerializedPage: (
    pageId: string,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">,
    revalidate?: number | false
  ) => Promise<string | FernDocs.ResolvedMdx>;

  serializeMdx: (
    content: string | undefined,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">
  ) => Promise<string | FernDocs.ResolvedMdx | undefined>;

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
  "use cache";

  unstable_cacheTag(domain);

  return await getEdgeFlags(domain);
});

const getBaseUrl = cache(
  async (domain: string): Promise<DocsV2Read.BaseUrl> => {
    "use cache";

    unstable_cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      unstable_cacheLife("seconds");
      return { domain, basePath: undefined };
    }
    return response.body.baseUrl;
  }
);

const getFiles = cache(
  async (domain: string): Promise<Record<string, FileData>> => {
    "use cache";

    unstable_cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      unstable_cacheLife("seconds");
      return {};
    }
    return mapValues(response.body.definition.filesV2, (file) => {
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
    "use cache";

    unstable_cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      unstable_cacheLife("seconds");
      notFound();
    }
    const latest = response.body.definition.apisV2[ApiDefinitionId(id)];
    if (latest != null) {
      return latest;
    }
    const v1 = response.body.definition.apis[ApiDefinitionId(id)];
    if (v1 == null) {
      unstable_cacheLife("seconds");
      notFound();
    }
    const flags = await cachedGetEdgeFlags(domain);
    return ApiDefinitionV1ToLatest.from(v1, flags).migrate();
  }
);

const unsafe_getFullRoot = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain);

  const response = await loadWithUrl(domain);
  if (!response.ok) {
    unstable_cacheLife("seconds");
    notFound();
  }
  const v1 = response.body.definition.config.root;

  if (!v1) {
    unstable_cacheLife("max");
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

const getRoot = cache(
  async (
    domain: string,
    authState: AuthState,
    authConfig: AuthEdgeConfig | undefined
  ) => {
    "use cache";

    unstable_cacheTag(domain);

    let root = await unsafe_getFullRoot(domain);

    if (authConfig) {
      root = pruneWithAuthState(authState, authConfig, root);
    }

    FernNavigation.utils.mutableUpdatePointsTo(root);

    return root;
  }
);

const getNavigationNode = cache(
  async (
    domain: string,
    id: string,
    authState: AuthState,
    authConfig: AuthEdgeConfig | undefined
  ) => {
    "use cache";

    unstable_cacheTag(domain);

    const root = await getRoot(domain, authState, authConfig);
    const collector = FernNavigation.NodeCollector.collect(root);
    const node = collector.get(FernNavigation.NodeId(id));
    if (node == null) {
      unstable_cacheLife("seconds");
      notFound();
    }
    return node;
  }
);

const getConfig = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain);

  const response = await loadWithUrl(domain);
  if (!response.ok) {
    unstable_cacheLife("seconds");
    notFound();
  }
  const { navigation, root, ...config } = response.body.definition.config;
  return config;
});

const getPage = cache(async (domain: string, pageId: string) => {
  "use cache";

  unstable_cacheTag(domain);

  const response = await loadWithUrl(domain);
  if (!response.ok) {
    unstable_cacheLife("seconds");
    notFound();
  }
  const page = response.body.definition.pages[pageId as PageId];
  if (page == null) {
    notFound();
  }
  return page;
});

const serializeMdx = cache(
  async (
    domain: string,
    content: string | undefined,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">
  ) => {
    "use cache";

    unstable_cacheTag(domain);

    if (content == null) {
      return undefined;
    }
    const [files, mdxBundlerFiles] = await Promise.all([
      getFiles(domain),
      getMdxBundlerFiles(domain),
    ]);

    const mdx = await uncachedSerializeMdx(content, {
      ...options,
      files: mdxBundlerFiles,
      replaceSrc: createFileResolver(files),
    });

    if (mdx == null) {
      // if we're returning the fallback string, this means validation failed
      unstable_cacheLife("seconds");
    }

    return mdx ?? content;
  }
);

const getSerializedPage = cache(
  async (
    domain: string,
    pageId: string,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">
  ) => {
    "use cache";

    unstable_cacheTag(domain);

    const [page, files, mdxBundlerFiles] = await Promise.all([
      getPage(domain, pageId),
      getFiles(domain),
      getMdxBundlerFiles(domain),
    ]);
    if (!page) {
      console.error(`[${domain}] Could not find page: ${pageId}`);
      unstable_cacheLife("seconds");
      notFound();
    }
    const mdx = await uncachedSerializeMdx(page.markdown, {
      ...options,
      filename: pageId,
      files: mdxBundlerFiles,
      replaceSrc: createFileResolver(files),
    });

    if (mdx == null) {
      // if we're returning the fallback string, this means validation failed
      unstable_cacheLife("seconds");
    }

    return mdx ?? page.markdown;
  }
);

const getMdxBundlerFiles = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain);

  const response = await loadWithUrl(domain);
  if (!response.ok) {
    return {};
  }
  return response.body.definition.jsFiles ?? {};
});

const getColors = cache(async (domain: string) => {
  "use cache";

  unstable_cacheTag(domain);

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
  "use cache";

  unstable_cacheTag(domain);

  const config = await getConfig(domain);
  if (!config) {
    unstable_cacheLife("seconds");
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
  const authConfig = await getAuthConfig(domain);

  const getAuthState = async (pathname?: string) => {
    const { getAuthState } = await createGetAuthState(
      domain,
      fern_token,
      authConfig
    );

    return await getAuthState(pathname);
  };

  return {
    domain,
    fern_token,
    authConfig,
    getBaseUrl: () => getBaseUrl(domain),
    getFiles: () => getFiles(domain),
    getApi: (id: string) => getApi(domain, id),
    getRoot: async () => getRoot(domain, await getAuthState(), authConfig),
    getNavigationNode: async (id: string) =>
      getNavigationNode(domain, id, await getAuthState(), authConfig),
    unsafe_getFullRoot: () => unsafe_getFullRoot(domain),
    getConfig: () => getConfig(domain),
    getPage: (pageId: string) => getPage(domain, pageId),
    serializeMdx: (content, options) => serializeMdx(domain, content, options),
    getSerializedPage: (pageId, options) =>
      getSerializedPage(domain, pageId, options),
    getColors: () => getColors(domain),
    getLayout: () => getLayout(domain),
    getAuthState,
    getEdgeFlags: () => cachedGetEdgeFlags(domain),
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
