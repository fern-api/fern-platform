import "server-only";

import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";

import { TabChild, hasRedirect } from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { FaIconServer } from "@/components/fa-icon-server";

import { FernLink } from "../components/FernLink";

export function HeaderTabsList({
  tabs,
  children,
}: {
  tabs: readonly TabChild[];
  children?: React.ReactNode;
}) {
  return (
    <Tabs.TabsList className="-mx-3 flex align-bottom text-sm">
      {tabs.map((tab) => (
        <Tabs.TabsTrigger key={tab.id} value={tab.id} asChild>
          <FernLink
            className={cn(
              "relative flex h-11 min-w-0 items-center justify-start space-x-2 px-3",
              "after:bg-(color:--accent-indicator) after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:opacity-0 after:content-['']",
              "data-[state=active]:text-(color:--accent-11) data-[state=active]:font-semibold data-[state=active]:after:opacity-100",
              "data-[state=inactive]:text-(color:--grayscale-a11) data-[state=inactive]:hover:text-default [&_svg]:size-3.5",
              {
                "opacity-50": tab.type !== "link" && tab.hidden,
              }
            )}
            href={
              tab.type === "link"
                ? tab.url
                : addLeadingSlash(hasRedirect(tab) ? tab.pointsTo : tab.slug)
            }
          >
            {tab.type !== "link" && tab.authed ? (
              <Lock />
            ) : (
              tab.icon && <FaIconServer icon={tab.icon} />
            )}
            <span className="truncate font-medium">{tab.title}</span>
          </FernLink>
        </Tabs.TabsTrigger>
      ))}
      {children}
    </Tabs.TabsList>
  );
}
