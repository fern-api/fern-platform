import React from "react";

import { Announcement } from "@/components/header/Announcement";
import { HeaderContent } from "@/components/header/HeaderContent";
import { NavbarLinks } from "@/components/header/NavbarLinks";
import { Logo } from "@/components/logo";
import { MdxServerComponent } from "@/components/mdx/server-component";
import { SidebarContainer } from "@/components/sidebar/SidebarContainer";
import { ThemedDocs } from "@/components/themes/ThemedDocs";
import { DocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";
import { withLogo } from "@/server/withLogo";

import { LoginButton } from "./login-button";

export default async function SharedLayout({
  children,
  headertabs,
  sidebar,
  loader,
}: {
  children: React.ReactNode;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
  loader: DocsLoader;
}) {
  const serialize = createCachedMdxSerializer(loader);
  const [{ basePath }, config, edgeFlags, files, colors, layout] =
    await Promise.all([
      loader.getBaseUrl(),
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
      sidebarFixed={
        !!colors.dark?.sidebarBackground ||
        !!colors.light?.sidebarBackground ||
        !layout.pageWidth
      }
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
          versionSelect={false}
          showSearchBar={layout.searchbarPlacement === "HEADER"}
          showThemeButton={Boolean(colors.dark && colors.light)}
          navbarLinks={<NavbarLinks loader={loader} />}
          loginButton={
            <React.Suspense fallback={null}>
              <LoginButton loader={loader} size="sm" className="mx-2" />
            </React.Suspense>
          }
        />
      }
      tabs={headertabs}
      sidebar={
        <SidebarContainer
          logo={
            <Logo
              logo={withLogo(config, resolveFileSrc, basePath)}
              className="w-fit shrink-0"
            />
          }
          tabs={false}
          versionSelect={false}
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
