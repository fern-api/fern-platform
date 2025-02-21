import "server-only";

import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";

import { TabChild, hasRedirect } from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { FaIconServer } from "@/components/fa-icon-server";

import { FernLink } from "../components/FernLink";

export function SidebarTabsList({
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
            className={cn(
              "min-h-8 lg:min-h-9",
              "hover:text-(color:--accent) rounded-2 group flex min-w-0 flex-1 select-none items-center justify-start py-2 text-base lg:px-3 lg:text-sm",
              "data-[state=inactive]:text-(color:--grayscale-a11) data-[state=active]:text-(color:--accent-a11) [&_svg]:size-4",
              { "opacity-50": tab.type !== "link" && tab.hidden }
            )}
            href={
              tab.type === "link"
                ? tab.url
                : addLeadingSlash(hasRedirect(tab) ? tab.pointsTo : tab.slug)
            }
          >
            <span
              className={cn(
                "bg-card-surface border-border-default rounded-3/2 mr-4 flex size-6 items-center justify-center border shadow-sm",
                "group-hover:group-data-[state=inactive]:bg-(--accent-a3) group-hover:group-data-[state=inactive]:border-(--accent-a8) group-hover:group-data-[state=inactive]:text-(color:--accent-a11)",
                "group-data-[state=active]:bg-(--accent-10) group-data-[state=active]:text-background group-data-[state=active]:border-transparent group-data-[state=active]:shadow-none"
              )}
            >
              {tab.type !== "link" && tab.authed ? (
                <Lock />
              ) : (
                tab.icon && <FaIconServer icon={tab.icon} />
              )}
            </span>
            <span className="truncate font-medium group-data-[state=active]:font-semibold">
              {tab.title}
            </span>
          </FernLink>
        </Tabs.TabsTrigger>
      ))}
      {children}
    </Tabs.TabsList>
  );
}
