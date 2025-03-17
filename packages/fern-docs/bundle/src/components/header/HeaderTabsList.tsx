import "server-only";

import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";

import { TabChild, hasRedirect } from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { slugToHref } from "@fern-docs/utils";

import { FernLink } from "@/components/FernLink";
import { FaIconServer } from "@/components/fa-icon-server";

export function HeaderTabsList({
  tabs,
  children,
}: {
  tabs: readonly TabChild[];
  children?: React.ReactNode;
}) {
  return (
    <Tabs.TabsList>
      {tabs.map((tab) => (
        <Tabs.TabsTrigger key={tab.id} value={tab.id} asChild>
          <FernLink
            className={cn({ "opacity-50": tab.type !== "link" && tab.hidden })}
            href={
              tab.type === "link"
                ? tab.url
                : slugToHref(hasRedirect(tab) ? tab.pointsTo : tab.slug)
            }
            scroll={true}
          >
            {tab.type !== "link" && tab.authed ? (
              <Lock />
            ) : (
              tab.icon && <FaIconServer icon={tab.icon} />
            )}
            <span className="truncate">{tab.title}</span>
          </FernLink>
        </Tabs.TabsTrigger>
      ))}
      {children}
    </Tabs.TabsList>
  );
}
