import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

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
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { mapValues } from "es-toolkit/object";
import { UnreachableCaseError } from "ts-essentials";

import { serializeMdx as uncachedSerializeMdx } from "@/components/mdx/bundlers/mdx-bundler";
import { FernSerializeMdxOptions } from "@/components/mdx/types";

import { AuthState, createGetAuthState } from "./auth/getAuthState";
import { createFileResolver } from "./file-resolver";
import { loadWithUrl } from "./loadWithUrl";
import { ColorsThemeConfig, FileData, RgbaColor } from "./types";
import { pruneWithAuthState } from "./withRbac";

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
  getApi: (id: string) => Promise<ApiDefinition.ApiDefinition | undefined>;

  /**
   * @returns the root node of the docs (aware of authentication)
   */
  getRoot: () => Promise<FernNavigation.RootNode | undefined>;

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
  getPage: (pageId: string) => Promise<
    | {
        markdown: string;
        editThisPageUrl?: string;
      }
    | undefined
  >;

  /**
   * @returns the serialized page for the given page id
   */
  getSerializedPage: (
    pageId: string,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">,
    revalidate?: number | false
  ) => Promise<string | FernDocs.ResolvedMdx | undefined>;

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
  }>;

  getAuthState: (pathname?: string) => Promise<AuthState>;
}

/**
 * The "use cache" tags help us speed up rendering specific parts of the page that are static.
 * It has a hard-limit of 2MB which is why we cannot use it to cache the entire response.
 * The expectation is that moving forward, we'll update the underlying API to be more cache-friendly
 * in a piece-meal fashion, and eventually remove all use of loadWithUrl.
 */
export const createCachedDocsLoader = async (
  domain: string,
  fern_token?: string
  // authConfig?: AuthEdgeConfig,
  // getAuthState: (pathname?: string) => AsyncOrSync<AuthState>
): Promise<DocsLoader> => {
  const authConfig = await getAuthEdgeConfig(domain);
  const { getAuthState } = await createGetAuthState(
    domain,
    fern_token,
    authConfig
  );

  const getBaseUrl = async (): Promise<DocsV2Read.BaseUrl> => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      return { domain, basePath: undefined };
    }
    return response.body.baseUrl;
  };

  const getFiles = async (): Promise<Record<string, FileData>> => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
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
  };

  const getApi = async (
    id: string
  ): Promise<ApiDefinition.ApiDefinition | undefined> => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      return undefined;
    }
    const latest = response.body.definition.apisV2[ApiDefinitionId(id)];
    if (latest != null) {
      return latest;
    }
    const v1 = response.body.definition.apis[ApiDefinitionId(id)];
    if (v1 == null) {
      return undefined;
    }
    return ApiDefinitionV1ToLatest.from(
      v1,
      await getEdgeFlags(domain)
    ).migrate();
  };

  const unsafe_getFullRoot = async () => {
    "use cache";

    cacheTag(domain);

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

    if ((await getEdgeFlags(domain)).isApiScrollingDisabled) {
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

  const getRoot = async () => {
    cacheTag(domain);

    let root = await unsafe_getFullRoot();

    if (!root) {
      return undefined;
    }

    if (authConfig) {
      root = pruneWithAuthState(await getAuthState(), authConfig, root);
    }

    if (root) {
      FernNavigation.utils.mutableUpdatePointsTo(root);
    }

    return root;
  };

  const getConfig = async () => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      return undefined;
    }
    const { navigation, root, ...config } = response.body.definition.config;
    return config;
  };

  const getPage = async (pageId: string) => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      return undefined;
    }
    return response.body.definition.pages[pageId as PageId];
  };

  const serializeMdx = async (
    content: string | undefined,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">
  ) => {
    "use cache";

    cacheTag(domain);

    if (content == null) {
      return undefined;
    }
    const [files, mdxBundlerFiles] = await Promise.all([
      getFiles(),
      getMdxBundlerFiles(),
    ]);

    const mdx = await uncachedSerializeMdx(content, {
      ...options,
      files: mdxBundlerFiles,
      replaceSrc: createFileResolver(files),
    });

    if (mdx == null) {
      // if we're returning the fallback string, this means validation failed
      cacheLife({
        stale: 0,
        revalidate: 0,
      });
    }

    return mdx ?? content;
  };

  const getSerializedPage = async (
    pageId: string,
    options?: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">
  ) => {
    "use cache";

    cacheTag(domain);

    const [page, files, mdxBundlerFiles] = await Promise.all([
      getPage(pageId),
      getFiles(),
      getMdxBundlerFiles(),
    ]);
    if (!page) {
      return undefined;
    }
    const mdx = await uncachedSerializeMdx(page.markdown, {
      ...options,
      filename: pageId,
      files: mdxBundlerFiles,
      replaceSrc: createFileResolver(files),
    });

    if (mdx == null) {
      // if we're returning the fallback string, this means validation failed
      cacheLife({
        stale: 0,
        revalidate: 0,
      });
    }

    return mdx ?? page.markdown;
  };

  const getMdxBundlerFiles = async () => {
    "use cache";

    cacheTag(domain);

    const response = await loadWithUrl(domain);
    if (!response.ok) {
      return {};
    }
    return response.body.definition.jsFiles ?? {};
  };

  const getColors = async () => {
    "use cache";

    cacheTag(domain);

    const [config, files] = await Promise.all([getConfig(), getFiles()]);
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
  };

  const getLayout = async () => {
    "use cache";

    cacheTag(domain);

    const config = await getConfig();
    if (!config) {
      return {
        logoHeight: DEFAULT_LOGO_HEIGHT,
        sidebarWidth: 288,
        headerHeight: 64,
        pageWidth: 1_408,
        contentWidth: 704,
        tabsPlacement: "SIDEBAR" as const,
      };
    }
    const logoHeight = config?.logoHeight ?? DEFAULT_LOGO_HEIGHT;
    const sidebarWidth = toPx(config?.layout?.sidebarWidth) ?? 288;
    const pageWidth =
      config?.layout?.pageWidth?.type === "full"
        ? undefined
        : (toPx(config?.layout?.pageWidth) ?? 1_408);
    const headerHeight = toPx(config?.layout?.headerHeight) ?? 64;
    const contentWidth = toPx(config?.layout?.contentWidth) ?? 704;
    const tabsPlacement = config?.layout?.tabsPlacement ?? "SIDEBAR";
    return {
      logoHeight,
      sidebarWidth,
      headerHeight,
      pageWidth,
      contentWidth,
      tabsPlacement,
    };
  };

  return {
    domain,
    fern_token,
    authConfig,
    getBaseUrl,
    getFiles,
    getApi,
    getRoot,
    unsafe_getFullRoot,
    getConfig,
    getPage,
    serializeMdx,
    getSerializedPage,
    getColors,
    getLayout,
    getAuthState: async (pathname?: string) => {
      return getAuthState(pathname);
    },
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
