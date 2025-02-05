"use server";

import "@/client/css/globals.scss";
import SidebarRootNode from "@/client/sidebar/nodes/SidebarRootNode";
import { renderThemeStylesheet } from "@/client/themes/stylesheet/renderThemeStylesheet";
import Preload, { PreloadHref } from "@/components/preload";
import StyledJsxRegistry from "@/components/registry";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { toImageDescriptor } from "@/utils/to-image-descriptor";
import { DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernTooltipProvider } from "@fern-docs/components";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { EdgeFlags } from "@fern-docs/utils";
import { compact } from "es-toolkit/array";
import { Provider } from "jotai";
import { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import GlobalStyle from "./global-style";
import Header from "./header/header";
import IfSidebar from "./sidebar/if-sidebar";
import Sidebar from "./sidebar/sidebar";
import SidebarProvider from "./sidebar/sidebar-provider";
import HeaderTabs from "./tabs/header-tabs";
import SidebarTabs from "./tabs/sidebar-tabs";

export async function generateViewport(): Promise<Viewport> {
  return {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: true,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsLoader = await createCachedDocsLoader();
  const [root, layout, colors, config, edgeFlags] = await Promise.all([
    docsLoader.getRoot(),
    docsLoader.getLayout(),
    docsLoader.getColors(),
    docsLoader.getConfig(),
    getEdgeFlags(docsLoader.domain),
  ]);

  const stylesheet = renderThemeStylesheet(
    colors,
    config?.typographyV2,
    config?.layout,
    config?.css,
    await docsLoader.getFiles(),
    true // TODO: fix
  );

  const foundNode = root
    ? FernNavigation.utils.findNode(
        root,
        FernNavigation.slugjoin(headers().get("x-pathname"))
      )
    : undefined;

  const sidebarRootNodes: FernNavigation.SidebarRootNode[] = [];

  if (root != null) {
    FernNavigation.traverseBF(root, (node) => {
      if (node.type === "sidebarRoot") {
        sidebarRootNodes.push(node);
        return SKIP;
      }
      return CONTINUE;
    });
  }

  return (
    <Provider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
            rel="stylesheet"
          />
          <Preload
            hrefs={generatePreloadHrefs(
              config?.typographyV2,
              await docsLoader.getFiles(),
              edgeFlags
            )}
          />
        </head>
        <body className="min-h-screen antialiased">
          <FernTooltipProvider>
            <StyledJsxRegistry>
              <GlobalStyle>{stylesheet}</GlobalStyle>
              <Header
                headerHeight={layout.headerHeight}
                logoHeight={layout.logoHeight}
                tabs={
                  root &&
                  layout.tabsPlacement === "HEADER" && (
                    <HeaderTabs root={root} />
                  )
                }
              />
              <div className="flex">
                {root && (
                  <Sidebar
                    // this should be the only instance where we send the root node to the client-side
                    // because this is a large payload, we don't want to send it multiple times.
                    root={JSON.parse(JSON.stringify(root))}
                    sidebarWidth={layout.sidebarWidth}
                    pageWidth={layout.pageWidth}
                    fixed={
                      !!colors?.light?.sidebarBackground ||
                      !!colors?.dark?.sidebarBackground
                    }
                    // initial node id is the node that is currently being viewed
                    // since the layout is rendered only once, this initial node id will be used to initialize the sidebar state
                    initialNodeId={
                      foundNode?.type === "found"
                        ? foundNode.node.id
                        : undefined
                    }
                  >
                    {layout.tabsPlacement === "SIDEBAR" && (
                      <SidebarTabs root={root} />
                    )}
                    {sidebarRootNodes.map((sidebarRootNode) => (
                      <IfSidebar
                        equals={sidebarRootNode.id}
                        defaultTrue={
                          sidebarRootNode.id ===
                          ((foundNode?.type === "found"
                            ? foundNode.sidebar?.id
                            : undefined) ?? "")
                        }
                      >
                        <SidebarProvider
                          key={sidebarRootNode.id}
                          sidebarRootNodeId={sidebarRootNode.id}
                        >
                          <SidebarRootNode node={sidebarRootNode} />
                        </SidebarProvider>
                      </IfSidebar>
                    ))}
                  </Sidebar>
                )}
                {children}
              </div>
            </StyledJsxRegistry>
          </FernTooltipProvider>
        </body>
      </html>
    </Provider>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const docsLoader = await createCachedDocsLoader();
  const [files, config, baseUrl, isSeoDisabled] = await Promise.all([
    docsLoader.getFiles(),
    docsLoader.getConfig(),
    docsLoader.getBaseUrl(),
    getSeoDisabled(docsLoader.domain),
  ]);
  const noindex = isSeoDisabled || config?.metadata?.noindex || false;
  const nofollow = isSeoDisabled || config?.metadata?.nofollow || false;

  return {
    generator: "https://buildwithfern.com",
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(docsLoader.domain)
    ),
    applicationName: config?.title,
    title: {
      template: config?.title ? "%s | " + config?.title : "%s",
      default: config?.title ?? "Documentation",
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: config?.metadata?.["og:title"],
      description: config?.metadata?.["og:description"],
      locale: config?.metadata?.["og:locale"],
      url: config?.metadata?.["og:url"],
      siteName: config?.metadata?.["og:site_name"],
      images: toImageDescriptor(
        files,
        config?.metadata?.["og:image"],
        config?.metadata?.["og:image:width"],
        config?.metadata?.["og:image:height"]
      ),
    },
    twitter: {
      site: config?.metadata?.["twitter:site"],
      creator: config?.metadata?.["twitter:handle"],
      title: config?.metadata?.["twitter:title"],
      description: config?.metadata?.["twitter:description"],
      images: toImageDescriptor(files, config?.metadata?.["twitter:image"]),
    },
    icons: {
      icon: config?.favicon
        ? toImageDescriptor(files, {
            type: "fileId",
            value: config.favicon,
          })?.url
        : undefined,
    },
  };
}

function generatePreloadHrefs(
  typography: DocsV2Read.LoadDocsForUrlResponse["definition"]["config"]["typographyV2"],
  files: Record<string, { url: string }>,
  edgeFlags: EdgeFlags
): PreloadHref[] {
  const toReturn: PreloadHref[] = [];

  const fontVariants = compact([
    typography?.bodyFont?.variants,
    typography?.headingsFont?.variants,
    typography?.codeFont?.variants,
  ]).flat();

  fontVariants.forEach((variant) => {
    try {
      const file = files[variant.fontFile];
      if (file != null) {
        toReturn.push({
          href: file.url,
          options: {
            as: "font",
            crossOrigin: "anonymous",
            type: `font/${getFontExtension(file.url)}`,
          },
        });
      }
    } catch {}
  });

  if (edgeFlags.isApiPlaygroundEnabled) {
    toReturn.push({
      href: "/api/fern-docs/auth/api-key-injection",
      options: { as: "fetch" },
    });
  }

  toReturn.push({
    href: edgeFlags.isSearchV2Enabled
      ? "/api/fern-docs/search/v2/key"
      : "/api/fern-docs/search/v1/key",
    options: { as: "fetch" },
  });

  return toReturn;
}

function getFontExtension(url: string): string {
  const ext = new URL(url).pathname.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}
