"use server";

import { RemoteIcon } from "@/components/remote-icon";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { addLeadingSlash } from "@fern-docs/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";
import { TabItem } from "./tablink";

export default async function HeaderTablist({
  tabs,
  activeTabId,
}: {
  tabs: readonly FernNavigation.TabChild[];
  activeTabId?: string;
}) {
  // Radix tabs enables keyboard navigation on the tablist (via arrow keys) which is important for accessibility
  return (
    <Tabs.Root asChild>
      <nav className="h-11 max-lg:hidden">
        <Tabs.List className="mx-auto flex max-w-[var(--spacing-page-width)] shrink-0 items-center px-1 md:px-3 lg:px-5">
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id} asChild>
              <TabItem
                tabId={tab.id}
                role="tab"
                href={tabToHref(tab)}
                active={tab.id === activeTabId}
              >
                {FernNavigation.hasMetadata(tab) && tab.authed ? (
                  <Lock />
                ) : (
                  tab.icon && <RemoteIcon icon={tab.icon} />
                )}
                <span className="truncate">{tab.title}</span>
              </TabItem>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </nav>
    </Tabs.Root>
  );
}

function tabToHref(
  tab: Omit<FernNavigation.TabChild, "child" | "children">
): string {
  if (FernNavigation.hasMetadata(tab)) {
    const pointsTo = FernNavigation.hasPointsTo(tab) ? tab.pointsTo : undefined;
    return addLeadingSlash(pointsTo ?? tab.slug);
  } else if ("url" in tab && typeof tab.url === "string") {
    return tab.url;
  }
  throw new Error("Invalid tab");
}
