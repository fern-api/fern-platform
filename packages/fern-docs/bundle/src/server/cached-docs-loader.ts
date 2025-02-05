import { toPx } from "@/utils/to-px";
import { ColorsThemeConfig, FileData, RgbaColor } from "@/utils/types";
import {
  ApiDefinition,
  DocsV1Read,
  DocsV2Read,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import { ApiDefinitionId, PageId } from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isPlainObject } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig } from "@fern-docs/auth";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { unstable_cache } from "next/cache";
import { AuthState, DomainAndHost, getAuthState } from "./auth/getAuthState";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithAuthState } from "./withRbac";
import { withServerProps } from "./withServerProps";

export interface DocsLoader {
  host: string;
  domain: string;
  fern_token: string | undefined;

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
  getApi: (
    id: string,
    endpointId: string | undefined
  ) => Promise<ApiDefinition.ApiDefinition | undefined>;

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
   * @returns a map of file names to their contents
   */
  getMdxBundlerFiles: () => Promise<Record<string, string>>;

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
}

/**
 * Force cache the loadWithUrl call, so that `JSON.parse()` is called only once.
 */
export const createCachedDocsLoader = async (): Promise<DocsLoader> => {
  const { domain, host, fern_token } = await withServerProps();
  const authConfig = await getAuthEdgeConfig(domain);
  const authState = await getAuthState(
    domain,
    host,
    fern_token,
    undefined,
    authConfig
  );
  return new CachedDocsLoaderImpl(authConfig, authState, fern_token);
};

class CachedDocsLoaderImpl implements DocsLoader {
  constructor(
    private _authConfig: AuthEdgeConfig | undefined,
    private _authState: AuthState & DomainAndHost,
    private _fern_token: string | undefined
  ) {}

  public get domain() {
    return this._authState.domain;
  }

  public get host() {
    return this._authState.host;
  }

  public get fern_token() {
    return this._fern_token;
  }

  public getBaseUrl = unstable_cache(
    async (): Promise<DocsV2Read.BaseUrl> => {
      const response = await loadWithUrl(this.domain);
      if (!response.ok) {
        return { domain: this.domain, basePath: undefined };
      }
      return response.body.baseUrl;
    },
    ["docs-loader:base-url", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getFiles = unstable_cache(
    async (): Promise<DocsV1Read.DocsDefinition["filesV2"]> => {
      const response = await loadWithUrl(this.domain);
      if (!response.ok) {
        return {};
      }
      return response.body.definition.filesV2;
    },
    ["docs-loader:files", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getApi = unstable_cache(
    async (id: string): Promise<ApiDefinition.ApiDefinition | undefined> => {
      const response = await loadWithUrl(this.domain);
      if (!response.ok) {
        return undefined;
      }
      return response.body.definition.apisV2[ApiDefinitionId(id)];
    },
    ["docs-loader:api", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getRoot = unstable_cache(
    async (): Promise<FernNavigation.RootNode | undefined> => {
      let root = await this.unsafe_getFullRoot();

      if (!root) {
        return undefined;
      }

      if (this.authConfig) {
        root = pruneWithAuthState(this.authState, this.authConfig, root);
      }

      if (root) {
        FernNavigation.utils.mutableUpdatePointsTo(root);
      }

      return root;
    },
    [
      "docs-loader:root",
      this.domain,
      this.authState.authed
        ? `authed:${[...(this.authState.user.roles ?? ["everyone"])].sort().join(",")}`
        : "anonymous",
    ],
    { tags: [this.domain], revalidate: false }
  );

  /**
   * beware: this returns the full tree, and ignores authentication.
   * do not use this except for revalidation.
   */
  public unsafe_getFullRoot = unstable_cache(
    async () => {
      const response = await loadWithUrl(this.domain);
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
      const response = await loadWithUrl(this.domain);
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
      const response = await loadWithUrl(this.domain);
      if (!response.ok) {
        return undefined;
      }
      return response.body.definition.pages[pageId as PageId];
    },
    ["docs-loader:page", this.domain],
    { tags: [this.domain], revalidate: false }
  );

  public getMdxBundlerFiles = unstable_cache(
    async () => {
      const response = await loadWithUrl(this.domain);
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
            logo: light.logo ? toFile(files[light.logo]) : undefined,
            backgroundImage: light.backgroundImage
              ? toFile(files[light.backgroundImage])
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
            logo: dark.logo ? toFile(files[dark.logo]) : undefined,
            backgroundImage: dark.backgroundImage
              ? toFile(files[dark.backgroundImage])
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

  private get authConfig() {
    return this._authConfig;
  }

  private get authState() {
    return this._authState;
  }
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

function toFile(file: object | undefined): FileData | undefined {
  if (!file || !isPlainObject(file) || typeof file.url !== "string") {
    return undefined;
  }
  return {
    url: file.url,
    width: typeof file.width === "number" ? file.width : undefined,
    height: typeof file.height === "number" ? file.height : undefined,
    blurDataUrl:
      typeof file.blurDataUrl === "string" ? file.blurDataUrl : undefined,
    alt: typeof file.alt === "string" ? file.alt : undefined,
  };
}
