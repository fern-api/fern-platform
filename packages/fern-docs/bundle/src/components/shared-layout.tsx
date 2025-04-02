import "server-only";

import React from "react";

import { Announcement } from "@/components/header/Announcement";
import { HeaderContent } from "@/components/header/HeaderContent";
import { NavbarLinks } from "@/components/header/NavbarLinks";
import { Logo } from "@/components/logo";
import { SidebarContainer } from "@/components/sidebar/SidebarContainer";
import { ThemedDocs } from "@/components/themes/ThemedDocs";
import { MdxServerComponent } from "@/mdx/components/server-component";
import { DocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";
import { withLogo } from "@/server/withLogo";

import { LoginButton } from "./login-button";

export default async function SharedLayout({
  children,
  headertabs,
  sidebar,
  versionSelect,
  loader,
}: {
  children: React.ReactNode;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
  versionSelect: React.ReactNode;
  loader: DocsLoader;
}) {
  const serialize = createCachedMdxSerializer(loader);
  const [{ basePath }, config, edgeFlags, files, colors, layout] =
    await Promise.all([
      loader.getMetadata(),
      loader.getConfig(),
      loader.getEdgeFlags(),
      loader.getFiles(),
      loader.getColors(),
      loader.getLayout(),
    ]);
  const theme = edgeFlags.isCohereTheme ? "cohere" : "default";
  const announcementText = config.announcement?.text;
  const resolveFileSrc = createFileResolver(files);

  return (
    <ThemedDocs
      theme={theme}
      isSidebarFixed={
        !!colors.dark?.sidebarBackground ||
        !!colors.light?.sidebarBackground ||
        layout.isHeaderDisabled
      }
      lightSidebarClassName={
        colors.light?.sidebarBackgroundTheme === "dark" ? "dark" : undefined
      }
      darkSidebarClassName={
        colors.dark?.sidebarBackgroundTheme === "light" ? "light" : undefined
      }
      lightHeaderClassName={
        colors.light?.headerBackgroundTheme === "dark" ? "dark" : undefined
      }
      darkHeaderClassName={
        colors.dark?.headerBackgroundTheme === "light" ? "light" : undefined
      }
      isHeaderDisabled={layout.isHeaderDisabled}
      announcement={
        announcementText && (
          <Announcement announcement={announcementText}>
            <React.Suspense fallback={announcementText}>
              <MdxServerComponent
                serialize={serialize}
                mdx={announcementText}
              />
            </React.Suspense>
          </Announcement>
        )
      }
      header={
        <HeaderContent
          className="max-w-page-width mx-auto"
          logo={
            <Logo
              logo={withLogo(config, resolveFileSrc, basePath)}
              className="w-fit shrink-0"
            />
          }
          versionSelect={
            <React.Suspense fallback={null}>{versionSelect}</React.Suspense>
          }
          showSearchBar={layout.searchbarPlacement === "HEADER"}
          navbarLinks={<NavbarLinks loader={loader} />}
          loginButton={
            <React.Suspense fallback={null}>
              <LoginButton loader={loader} size="sm" className="ml-2" />
            </React.Suspense>
          }
        />
      }
      tabs={headertabs}
      showSearchBarInTabs={layout.searchbarPlacement === "HEADER_TABS"}
      sidebar={
        <SidebarContainer
          logo={
            <Logo
              logo={withLogo(config, resolveFileSrc, basePath)}
              className="w-fit shrink-0"
            />
          }
          showSearchBar={layout.searchbarPlacement === "SIDEBAR"}
          showHeaderInSidebar={layout.isHeaderDisabled}
          versionSelect={
            <React.Suspense fallback={null}>{versionSelect}</React.Suspense>
          }
          navbarLinks={
            <React.Suspense fallback={null}>
              <NavbarLinks loader={loader} />
            </React.Suspense>
          }
          loginButton={
            <React.Suspense fallback={null}>
              <LoginButton
                loader={loader}
                className="my-6 flex w-full justify-between lg:hidden"
                showIcon
              />
            </React.Suspense>
          }
        >
          {sidebar}
        </SidebarContainer>
      }
    >
      {children}
    </ThemedDocs>
  );
}
