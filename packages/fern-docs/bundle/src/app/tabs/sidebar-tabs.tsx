"use server";

import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFindNode } from "@/server/find-node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { RemoteIconServer } from "@fern-docs/components/remote-icon/server";
import { Lock } from "lucide-react";
import { headers } from "next/headers";
import TabItem from "./tab-item";
import { tabToHref } from "./utils";

export default async function SidebarTabs() {
  const slug = FernNavigation.slugjoin(headers().get("x-pathname"));
  const docsLoader = await createCachedDocsLoader();
  const findNode = createFindNode(docsLoader);
  const { tabs } = await findNode(slug);

  if (tabs.length === 0) {
    return false;
  }

  return (
    <div role="tablist" aria-label="tabs" className="my-6 list-none">
      {tabs.map((tab, i) => (
        <TabItem
          index={i}
          role="tab"
          key={i}
          href={tabToHref(tab)}
          className="group flex min-h-8 items-center gap-4 text-sm font-medium text-[var(--grayscale-a11)] hover:text-[var(--accent-11)] data-[state=active]:font-semibold data-[state=active]:text-[var(--accent-11)] lg:min-h-9 lg:px-3"
        >
          <div className="bg-card-surface ring-border-default group-hover:bg-tag-primary text-faded group-data-[state=active]:text-background group-hover:group-data-[state=active]:text-background pointer-events-none size-6 shrink-0 rounded-md p-1 shadow-sm ring-1 group-hover:text-[var(--accent-11)] group-hover:ring-[var(--accent-11)] group-data-[state=active]:bg-[var(--accent-11)] group-data-[state=active]:ring-0 group-hover:group-data-[state=active]:bg-[var(--accent-11)] [&_svg]:size-4">
            {FernNavigation.hasMetadata(tab) && tab.authed ? (
              <Lock />
            ) : (
              <RemoteIconServer icon={tab.icon ?? "book-open"} />
            )}
          </div>
          <span className="truncate">{tab.title}</span>
        </TabItem>
      ))}
    </div>
  );
}
