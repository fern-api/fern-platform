"use server";

import "@/client/css/globals.scss";
import StyledJsxRegistry from "@/components/registry";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { toPx } from "@/utils/to-px";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { Metadata, Viewport } from "next";
import Header from "./header/header";
import Sidebar from "./sidebar/sidebar";
import HeaderTabs from "./tabs/header-tabs";
import SidebarTabs from "./tabs/sidebar-tabs";

export async function generateMetadata(): Promise<Metadata> {
  return { generator: "Fern Docs" };
}

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
  const [root, config, colors] = await Promise.all([
    docsLoader.getRoot(),
    docsLoader.getConfig(),
    docsLoader.getColors(),
  ]);
  const logoHeight = config?.logoHeight ?? DEFAULT_LOGO_HEIGHT;
  const sidebarWidth = toPx(config?.layout?.sidebarWidth) ?? 288;
  const pageWidth =
    config?.layout?.pageWidth?.type === "full"
      ? undefined
      : (toPx(config?.layout?.pageWidth) ?? 1_408);
  const headerHeight = toPx(config?.layout?.headerHeight) ?? 64;
  const contentWidth = toPx(config?.layout?.contentWidth) ?? 704;
  const tabsPlacement = config?.layout?.tabsPlacement ?? "SIDEBAR";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <StyledJsxRegistry>
          <Header
            headerHeight={headerHeight}
            logoHeight={logoHeight}
            tabs={tabsPlacement === "HEADER" && <HeaderTabs />}
          />
          {root && (
            <Sidebar
              root={root}
              sidebarWidth={sidebarWidth}
              pageWidth={pageWidth}
              contentWidth={contentWidth}
              fixed={
                !!colors?.light?.sidebarBackground ||
                !!colors?.dark?.sidebarBackground
              }
              tabs={tabsPlacement === "SIDEBAR" && <SidebarTabs />}
            />
          )}
          <div
            style={{
              width: contentWidth,
              position: "relative",
              top: `var(--header-height)`,
            }}
            className="mx-auto"
          >
            {children}
          </div>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
