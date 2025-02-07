"use server";

import { NavbarLink } from "@/components/atoms";
import { BgImageGradient } from "@/components/components/BgImageGradient";
import { SearchV2Trigger } from "@/components/search/SearchV2";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";
import { Header, HeaderNavLayout } from "./header";
import { Logo } from "./logo";
import { NavbarLinks } from "./navbar-links";
import HeaderTablist from "./tablist";

export default async function HeaderSlot({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = FernNavigation.slugjoin(params.slug);
  const docsLoader = await createCachedDocsLoader(getDocsDomainApp());

  const [config, colors, layout, root] = await Promise.all([
    docsLoader.getConfig(),
    docsLoader.getColors(),
    docsLoader.getLayout(),
    docsLoader.getRoot(),
  ]);

  const found = root ? FernNavigation.utils.findNode(root, slug) : undefined;
  const tabs = found?.type === "found" ? found.tabs : undefined;

  const headerHeight = layout?.headerHeight ?? DEFAULT_HEADER_HEIGHT;
  const tabsHeight = tabs?.length ? 44 : 0;

  const navbarLinks: NavbarLink[] = [];

  config?.navbarLinks?.forEach((link) => {
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
      });
    }
  });

  return (
    <Header initialHeight={headerHeight + tabsHeight}>
      <div className="clipped-background">
        <BgImageGradient colors={colors} />
      </div>
      <HeaderNavLayout
        height={headerHeight}
        left={
          <Logo
            logo={{
              height: config?.logoHeight,
              href: config?.logoHref,
              light: colors.light?.logo,
              dark: colors.dark?.logo,
            }}
          />
        }
        center={<SearchV2Trigger />}
        right={
          <NavbarLinks
            links={navbarLinks}
            showThemeButton={colors.light != null && colors.dark != null}
          />
        }
      />
      {tabs && tabs.length > 0 && (
        <HeaderTablist tabs={tabs} activeTabId={undefined} />
      )}
    </Header>
  );
}
