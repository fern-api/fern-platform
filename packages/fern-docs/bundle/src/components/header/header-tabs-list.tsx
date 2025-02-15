import "server-only";

import * as Tabs from "@radix-ui/react-tabs";
import { Lock } from "lucide-react";

import { TabChild, hasRedirect } from "@fern-api/fdr-sdk/navigation";
import { FaIconServer, cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { FernLink } from "../components/FernLink";

export function HeaderTabsList({
  tabs,
  children,
}: {
  tabs: TabChild[];
  children?: React.ReactNode;
}) {
  return (
    <Tabs.TabsList className="max-w-page-width mx-auto flex px-1 align-bottom text-sm md:px-3 lg:px-5">
      {tabs.map((tab) => (
        <Tabs.TabsTrigger key={tab.id} value={tab.id} asChild>
          <FernLink
            className={cn(
              "relative flex h-11 min-w-0 items-center justify-start space-x-2 px-3",
              "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-(--accent-11) after:opacity-0 after:content-['']",
              "data-[state=active]:font-semibold data-[state=active]:text-(--accent-11) data-[state=active]:after:opacity-100",
              "data-[state=inactive]:t-muted data-[state=inactive]:hover:t-default",
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
              <Lock className="size-3.5" />
            ) : (
              tab.icon && <FaIconServer icon={tab.icon} className="size-3.5" />
            )}
            <span className="truncate font-medium">{tab.title}</span>
          </FernLink>
        </Tabs.TabsTrigger>
      ))}
      {children}
    </Tabs.TabsList>
  );
}
