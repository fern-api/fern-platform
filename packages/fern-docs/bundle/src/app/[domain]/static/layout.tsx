"use cache";

import { unstable_cacheTag } from "next/cache";

import { TabbedNode, traverseBF } from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { isTrailingSlashEnabled } from "@fern-docs/utils";

import type { NavbarLink } from "@/components/atoms/types";
import { Announcement } from "@/components/header/announcement";
import { Header } from "@/components/header/header";
import { HeaderNavbarLink } from "@/components/header/header-navbar-link";
import { HeaderTabs } from "@/components/header/header-tabs";
import { Logo } from "@/components/logo";
import { MdxServerComponent } from "@/components/mdx/server-component";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ThemedDocs } from "@/components/themes/ThemedDocs";
import { getApiRouteSupplier } from "@/components/util/getApiRouteSupplier";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { withLogo } from "@/server/withLogo";
import { RootNodeProvider } from "@/state/navigation";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  unstable_cacheTag(domain, "static", "layout");

  const loader = await createCachedDocsLoader(domain);
  const [
    { basePath },
    root,
    config,
    edgeFlags,
    files,
    colors,
    layout,
    authConfig,
    authState,
  ] = await Promise.all([
    loader.getBaseUrl(),
    loader.getRoot(),
    loader.getConfig(),
    loader.getEdgeFlags(),
    loader.getFiles(),
    loader.getColors(),
    loader.getLayout(),
    loader.getAuthConfig(),
    loader.getAuthState(),
  ]);
  const theme = edgeFlags.isCohereTheme ? "cohere" : "default";
  const announcementText = config.announcement?.text;
  const resolveFileSrc = createFileResolver(files);

  const navbarLinks: NavbarLink[] = [];

  config.navbarLinks?.forEach((link) => {
    if (link.type === "github") {
      navbarLinks.push({
        type: "github",
        href: link.url,
        className: undefined,
        id: undefined,
      });
    } else {
      navbarLinks.push({
        type: link.type,
        href: link.url,
        text: link.text,
        icon: link.icon,
        rightIcon: link.rightIcon,
        rounded: link.rounded,
        className: undefined,
        id: undefined,
        returnToQueryParam: undefined,
      });
    }
  });

  // HACKHACK: This is a hack to add a login button to the navbar if the user is not authenticated
  if (authConfig?.type === "basic_token_verification" && !authState.authed) {
    navbarLinks.push({
      type: "outlined",
      text: "Login",
      href: withDefaultProtocol(authConfig.redirect),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-login-button",
      returnToQueryParam: getReturnToQueryParam(authConfig),
    });
  }

  const getApiRoute = getApiRouteSupplier({
    basepath: basePath,
    includeTrailingSlash: isTrailingSlashEnabled(),
  });

  if (authState.authed) {
    navbarLinks.push({
      type: "outlined",
      text: "Logout",
      href: getApiRoute("/api/fern-docs/auth/logout"),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-logout-button",
      returnToQueryParam: getReturnToQueryParam(authConfig),
    });
  }

  const tabbedNodes: TabbedNode[] = [];

  traverseBF(root, (node) => {
    if (node.type === "tabbed") {
      tabbedNodes.push(node);
      return SKIP;
    }
    if (node.type === "sidebarRoot") {
      return SKIP;
    }
    return CONTINUE;
  });

  return (
    <RootNodeProvider root={root}>
      <ThemedDocs
        theme={theme}
        announcement={
          announcementText && (
            <Announcement announcement={announcementText}>
              <MdxServerComponent loader={loader} mdx={announcementText} />
            </Announcement>
          )
        }
        header={
          <Header
            className="max-w-page-width mx-auto"
            logo={
              <Logo
                logo={withLogo(config, resolveFileSrc, basePath)}
                className="w-fit shrink-0"
              />
            }
            versionSelect={false}
            showSearchBar={layout.searchbarPlacement === "HEADER"}
            showThemeButton={Boolean(colors.dark && colors.light)}
            navbarLinks={
              <>
                {navbarLinks.map((navbarLink, idx) => (
                  <HeaderNavbarLink key={idx} navbarLink={navbarLink} />
                ))}
              </>
            }
          />
        }
        tabs={
          tabbedNodes.length > 0 && (
            <>
              {tabbedNodes.map((node) => (
                <HeaderTabs key={node.id} node={node} />
              ))}
            </>
          )
        }
        sidebar={
          <Sidebar
            logo={
              <Logo
                logo={withLogo(config, resolveFileSrc, basePath)}
                className="w-fit shrink-0"
              />
            }
            versionSelect={false}
            navbarLinks={navbarLinks}
          />
        }
      >
        {children}
      </ThemedDocs>
    </RootNodeProvider>
  );
}
