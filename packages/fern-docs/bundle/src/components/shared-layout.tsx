import "server-only";

import React from "react";

import { Announcement } from "@/components/header/Announcement";
import { HeaderContent } from "@/components/header/HeaderContent";
import { NavbarLinks } from "@/components/header/NavbarLinks";
import { SidebarContainer } from "@/components/sidebar/SidebarContainer";
import { ThemedDocs } from "@/components/themes/ThemedDocs";
import { MdxServerComponent } from "@/mdx/components/server-component";
import { DocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { LoginButton } from "./login-button";

export default async function SharedLayout({
  children,
  headertabs,
  sidebar,
  versionSelect,
  loader,
  logo,
}: {
  children: React.ReactNode;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
  versionSelect: React.ReactNode;
  loader: DocsLoader;
  logo: React.ReactNode;
}) {
  const serialize = createCachedMdxSerializer(loader);
  const [config, edgeFlags, colors, layout] = await Promise.all([
    loader.getConfig(),
    loader.getEdgeFlags(),
    loader.getColors(),
    loader.getLayout(),
  ]);
  const theme = edgeFlags.isCohereTheme ? "cohere" : "default";
  const announcementText = config.announcement?.text;

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
          logo={<React.Suspense fallback={null}>{logo}</React.Suspense>}
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
          logo={<React.Suspense fallback={null}>{logo}</React.Suspense>}
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
