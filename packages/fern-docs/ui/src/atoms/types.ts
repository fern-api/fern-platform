import type {
  DocsV1Read,
  DocsV2Read,
  FdrAPI,
} from "@fern-api/fdr-sdk/client/types";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { FernUser } from "@fern-docs/auth";
import { NextSeoProps } from "@fern-docs/next-seo";
import type { EdgeFlags } from "@fern-docs/utils";
import {
  ColorsConfig,
  SidebarTab,
  VersionSwitcherInfo,
} from "@fern-platform/fdr-utils";
import type { LDContext } from "launchdarkly-react-client-sdk";
import { CustomerAnalytics } from "../analytics/types";
import { DocsContent } from "../resolver/DocsContent";
import { FernTheme } from "../themes/ThemedDocs";

export interface NavigationProps {
  currentTabIndex: number | undefined;
  tabs: SidebarTab[];
  currentVersionId: FernNavigation.VersionId | undefined;
  versions: VersionSwitcherInfo[];
  sidebar: FernNavigation.SidebarRootNode | undefined;
  trailingSlash: boolean;
}

export interface AnnouncementConfig {
  text: string;
  mdx: FernDocs.MarkdownText;
}

export interface DefaultNavbarLink {
  type: "filled" | "outlined" | "minimal" | "primary" | "secondary";
  href: string;
  text: string | undefined;
  icon: string | undefined;
  rightIcon: string | undefined;
  rounded: boolean | undefined;
  className: string | undefined;
  id: string | undefined;
}

export interface GithubNavbarLink {
  type: "github";
  href: string;
  className: string | undefined;
  id: string | undefined;
}

export type NavbarLink = DefaultNavbarLink | GithubNavbarLink;

export interface LaunchDarklyInfo {
  clientSideId: string;
  contextEndpoint: string;
  context: LDContext | undefined;
  defaultFlags: Record<string, unknown> | undefined;
}

export interface FeatureFlagsConfig {
  launchDarkly: LaunchDarklyInfo | undefined;
}

export interface DocsProps {
  baseUrl: DocsV2Read.BaseUrl;
  navigation: NavigationProps;
  title: string | undefined;
  favicon: string | undefined;
  colors: ColorsConfig;
  announcement: AnnouncementConfig | undefined;
  layout: DocsV1Read.DocsLayoutConfig | undefined;
  js: DocsV1Read.JsConfig | undefined;
  navbarLinks: NavbarLink[];
  logoHeight: DocsV1Read.Height | undefined;
  logoHref: DocsV1Read.Url | undefined;
  files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
  content: DocsContent;
  edgeFlags: EdgeFlags;
  apis: FdrAPI.ApiDefinitionId[];
  seo: NextSeoProps;
  analytics: CustomerAnalytics | undefined; // deprecated
  analyticsConfig: DocsV1Read.AnalyticsConfig | undefined;
  fallback: Record<string, any>;
  theme: FernTheme;
  user: FernUser | undefined;
  defaultLang: DocsV1Read.ProgrammingLanguage;
  stylesheet: string;
  featureFlagsConfig: FeatureFlagsConfig | undefined;
}
