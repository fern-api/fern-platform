import { serializeMdx } from "@/components/mdx/bundlers/mdx-bundler";
import { FernSerializeMdxOptions } from "@/components/mdx/types";
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
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { AsyncOrSync, UnreachableCaseError } from "ts-essentials";
import { AuthState, createGetAuthState } from "./auth/getAuthState";
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
    options?: Omit<FernSerializeMdxOptions, "files">,
    revalidate?: number | false
  ) => Promise<FernDocs.MarkdownText | undefined>;

  serializeMdx: (
    content: string | undefined,
    options?: Omit<FernSerializeMdxOptions, "files">
  ) => Promise<FernDocs.MarkdownText | undefined>;

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
 * Force cache the loadWithUrl call, so that `JSON.parse()` is called only once.
 */
export const createCachedDocsLoader = async (
  domain: string,
  fern_token?: string
): Promise<DocsLoader> => {
  const authConfig = await getAuthEdgeConfig(domain);
  const { getAuthState } = await createGetAuthState(
    domain,
    fern_token,
    authConfig
  );
  return new CachedDocsLoaderImpl(domain, fern_token, authConfig, getAuthState);
};

/**
 * This class implements the DocsLoader interface using loadWithUrl + unstable_cache.
 * The unstable_cache helps us speed up rendering specific parts of the page that are static.
 * It has a hard-limit of 2MB which is why we cannot use it to cache the entire response.
 * The expectation is that moving forward, we'll update the underlying API to be more cache-friendly
 * in a piece-meal fashion, and eventually remove all use of loadWithUrl.
 */
class CachedDocsLoaderImpl implements DocsLoader {
  constructor(
    private _domain: string,
    private _fern_token: string | undefined,
    private _authConfig: AuthEdgeConfig | undefined,
    private _getAuthState: (pathname?: string) => AsyncOrSync<AuthState>
  ) {}

  public get domain() {
    return this._domain;
  }

  public get fern_token() {
    return this._fern_token;
  }

  // this reduces the number of times we call loadWithUrl to render the same page
  // unlike unstable_cache, this does _not_ interact with the data cache.
  private loadWithUrl = cache(loadWithUrl);

  public getBaseUrl = unstable_cache(
    async (): Promise<DocsV2Read.BaseUrl> => {
      const response = await this.loadWithUrl(this.domain);
      if (!response.ok) {
        return { domain: this.domain, basePath: undefined };
      }
      return response.body.baseUrl;
    },
    ["docs-loader:base-url", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getFiles = unstable_cache(
    async (): Promise<Record<string, FileData>> => {
      const response = await this.loadWithUrl(this.domain);
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
    },
    ["docs-loader:files", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getApi = unstable_cache(
    async (id: string): Promise<ApiDefinition.ApiDefinition | undefined> => {
      const response = await this.loadWithUrl(this.domain);
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
        await getEdgeFlags(this.domain)
      ).migrate();
    },
    ["docs-loader:api", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getRoot = async () => {
    let root = await this.unsafe_getFullRoot();

    if (!root) {
      return undefined;
    }

    if (this.authConfig) {
      root = pruneWithAuthState(
        await this.getAuthState(),
        this.authConfig,
        root
      );
    }

    if (root) {
      FernNavigation.utils.mutableUpdatePointsTo(root);
    }

    return root;
  };

  /**
   * beware: this returns the full tree, and ignores authentication.
   * do not use this except for revalidation.
   */
  public unsafe_getFullRoot = unstable_cache(
    async () => {
      const response = await this.loadWithUrl(this.domain);
      if (!response.ok) {
        return undefined;
      }
      const v1 = response.body.definition.config.root;

      if (!v1) {
        return undefined;
      }

      const root =
        FernNavigation.migrate.FernNavigationV1ToLatest.create().root(v1);

      if ((await getEdgeFlags(this.domain)).isApiScrollingDisabled) {
        FernNavigation.traverseBF(root, (node) => {
          if (node.type === "apiReference") {
            node.paginated = true;
            return CONTINUE;
          }
          return SKIP;
        });
      }

      return root;
    },
    ["docs-loader:full-root", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getConfig = unstable_cache(
    async () => {
      const response = await this.loadWithUrl(this.domain);
      if (!response.ok) {
        return undefined;
      }
      const { navigation, root, ...config } = response.body.definition.config;
      return config;
    },
    ["docs-loader:config", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getPage = unstable_cache(
    async (pageId: string) => {
      const response = await this.loadWithUrl(this.domain);
      if (!response.ok) {
        return undefined;
      }
      return response.body.definition.pages[pageId as PageId];
    },
    ["docs-loader:page", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public serializeMdx = unstable_cache(
    async (
      content: string | undefined,
      options?: Omit<FernSerializeMdxOptions, "files">
    ) => {
      if (content == null) {
        return undefined;
      }
      return serializeMdx(content, {
        ...options,
        files: await this.getMdxBundlerFiles(),
      });
    },
    ["docs-loader:serialize-mdx", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getSerializedPage = async (
    pageId: string,
    options?: Omit<FernSerializeMdxOptions, "files">,
    revalidate?: number | false
  ) => {
    const page = await this.getPage(pageId);
    if (!page) {
      return undefined;
    }
    const cachedSerializeMdx = unstable_cache(
      async () => {
        const serialized = await serializeMdx(page.markdown, {
          ...options,
          files: await this.getMdxBundlerFiles(),
        });
        return serialized;
      },
      [
        "docs-loader:serialized-page",
        pageId,
        JSON.stringify(options?.scope),
        String(options?.showError),
        String(options?.toc),
      ],
      { tags: [this.domain], revalidate }
    );
    return cachedSerializeMdx();
  };

  public getMdxBundlerFiles = unstable_cache(
    async () => {
      const response = await this.loadWithUrl(this.domain);
      if (!response.ok) {
        return {};
      }
      return response.body.definition.jsFiles ?? {};
    },
    ["docs-loader:mdx-bundler-files", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getColors = async () => {
    const [config, files] = await Promise.all([
      this.getConfig(),
      this.getFiles(),
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
  };

  public getLayout = async () => {
    const config = await this.getConfig();
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

  public get authConfig() {
    return this._authConfig;
  }

  public getAuthState = async (pathname?: string) => {
    return this._getAuthState(pathname);
  };
}

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
