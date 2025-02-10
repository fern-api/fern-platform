import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { ResolvedMdx } from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { FernUser } from "@fern-docs/auth";
import type { EdgeFlags } from "@fern-docs/utils";
import { SidebarTab, VersionSwitcherInfo } from "@fern-platform/fdr-utils";
import type { LDContext } from "launchdarkly-react-client-sdk";

import { ColorsThemeConfig, FileData } from "@/server/types";

import { CustomerAnalytics } from "../analytics/types";
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
  mdx: ResolvedMdx | undefined;
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
  contextEndpoint: string | undefined;
  context: LDContext | undefined;
  defaultFlags: object | undefined;
  options:
    | {
        baseUrl: string | undefined;
        streamUrl: string | undefined;
        eventsUrl: string | undefined;
        hash: string | undefined;
      }
    | undefined;
}

export interface FeatureFlagsConfig {
  launchDarkly: LaunchDarklyInfo | undefined;
}

export interface DocsProps {
  baseUrl: DocsV2Read.BaseUrl;
  navigation: NavigationProps;
  title: string | undefined;
  favicon: string | undefined;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
  announcement: AnnouncementConfig | undefined;
  layout: DocsV1Read.DocsLayoutConfig | undefined;
  js: JsConfig | undefined;
  navbarLinks: NavbarLink[];
  logo: LogoConfiguration;
  edgeFlags: EdgeFlags;
  analytics: CustomerAnalytics | undefined; // deprecated
  analyticsConfig: DocsV1Read.AnalyticsConfig | undefined;
  fallback: Record<string, any>;
  theme: FernTheme;
  user: FernUser | undefined;
  defaultLang: DocsV1Read.ProgrammingLanguage;
  featureFlagsConfig: FeatureFlagsConfig | undefined;
}

export interface LogoConfiguration {
  height: number | undefined;
  href: string | undefined;
  light: FileData | undefined;
  dark: FileData | undefined;
}

export interface JsConfig {
  remote:
    | {
        url: string;
        strategy:
          | "beforeInteractive"
          | "afterInteractive"
          | "lazyOnload"
          | undefined;
      }[]
    | undefined;
  inline: string[] | undefined;
}
