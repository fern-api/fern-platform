"use server";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { cn } from "@fern-docs/components";
import { RemoteIconServer } from "@fern-docs/components/remote-icon/server";
import { Lock } from "lucide-react";
import TabItem from "./tab-item";
import { tabToHref } from "./utils";

export default async function HeaderTablist({
  tabs,
  defaultActiveTabId,
}: {
  tabs: FernNavigation.TabChild[];
  defaultActiveTabId?: string;
}) {
  return (
    <div className="border-concealed h-11 border-b max-lg:hidden">
      <div
        className="mx-auto flex max-w-[var(--spacing-page-width)] shrink-0 items-center px-1 md:px-3 lg:px-5"
        aria-label="tabs"
        role="tablist"
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tabId={tab.id}
            role="tab"
            href={tabToHref(tab)}
            defaultActive={tab.id === defaultActiveTabId}
            className={cn(
              "flex items-center justify-start gap-2 p-3 text-sm font-medium text-[var(--grayscale-a11)] hover:text-[var(--grayscale-a12)] data-[state=active]:text-[var(--accent-11)]",
              "relative after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-[var(--accent-11)] after:opacity-0 data-[state=active]:after:opacity-100",
              "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
            )}
          >
            {FernNavigation.hasMetadata(tab) && tab.authed ? (
              <Lock />
            ) : (
              tab.icon && <RemoteIconServer icon={tab.icon} />
            )}
            <span className="truncate">{tab.title}</span>
          </TabItem>
        ))}
      </div>
    </div>
  );
}
