"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { FaIcon, cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { BgImageGradient } from "@/components/components/BgImageGradient";
import { FernLink } from "@/components/components/FernLink";
import { ColorsThemeConfig } from "@/server/types";
import { useLayout } from "@/state/layout";
import { useCurrentTab, useTabs } from "@/state/navigation";

import { FernHeader } from "./fern-header";

export function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  colors,
  headerHeight,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
  headerHeight?: number;
}) {
  const layout = useLayout();
  return (
    <>
      <FernHeader
        className="bg-header border-concealed fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg"
        defaultHeight={headerHeight}
      >
        {announcement}
        <div className="relative">
          <div className="clipped-background">
            <BgImageGradient
              className="h-screen opacity-60 dark:opacity-80"
              colors={colors}
            />
          </div>
          <div className="h-header-height-real flex items-center">{header}</div>
          <HeaderTabs />
        </div>
      </FernHeader>

      <main className="max-w-page-width relative mx-auto mt-[var(--header-height)] flex flex-row">
        <aside
          className={cn(
            "w-[var(--spacing-sidebar-width)]",
            "sticky top-[var(--header-height)] z-30 flex h-fit max-h-[calc(100dvh-var(--header-height))] shrink-0 flex-col",
            { hidden: layout === "page" }
          )}
        >
          {sidebar}
        </aside>

        {children}
      </main>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </>
  );
}

function HeaderTabs() {
  const currentTab = useCurrentTab();
  const tabs = useTabs();
  if (!tabs || tabs.length === 0) {
    return null;
  }
  return (
    <Tabs.Root value={currentTab?.id} className="select-none">
      <Tabs.TabsList className="max-w-page-width mx-auto flex px-1 align-bottom text-sm md:px-3 lg:px-5">
        {tabs.map((tab) => (
          <Tabs.TabsTrigger key={tab.id} value={tab.id} asChild>
            <FernLink
              className={cn(
                "relative flex h-11 min-w-0 items-center justify-start space-x-2 px-3",
                "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--accent-11)] after:opacity-0 after:content-['']",
                "data-[state=active]:font-semibold data-[state=active]:text-[var(--accent-11)] data-[state=active]:after:opacity-100",
                "data-[state=inactive]:t-muted data-[state=inactive]:hover:t-default",
                {
                  "opacity-50": tab.type !== "link" && tab.hidden,
                }
              )}
              href={
                tab.type === "link"
                  ? tab.url
                  : addLeadingSlash(
                      FernNavigation.hasRedirect(tab) ? tab.pointsTo : tab.slug
                    )
              }
            >
              {tab.type !== "link" && tab.authed ? (
                <Lock className="size-3.5" />
              ) : (
                tab.icon && <FaIcon icon={tab.icon} className="size-3.5" />
              )}
              <span className="truncate font-medium">{tab.title}</span>
            </FernLink>
          </Tabs.TabsTrigger>
        ))}
      </Tabs.TabsList>
    </Tabs.Root>
  );
}

export default DefaultDocs;
