import { memo } from "react";

import { TabChild, hasPointsTo } from "@fern-api/fdr-sdk/navigation";
import { FaIcon, cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { FernLink } from "../components/FernLink";

export declare namespace SidebarTabButton {
  export interface Props {
    tab: TabChild;
    selected: boolean;
  }
}

const UnmemoizedSidebarTabButton: React.FC<SidebarTabButton.Props> = ({
  tab,
  selected,
}) => {
  return (
    <li>
      <FernLink
        className={cn(
          "min-h-8 lg:min-h-9",
          "group/tab-button hover:t-accent flex min-w-0 flex-1 select-none items-center justify-start rounded-lg py-2 text-base group-hover/tab-button:transition lg:px-3 lg:text-sm",
          "data-[state=inactive]:text-muted data-[state=active]:t-accent"
        )}
        href={
          tab.type === "link"
            ? tab.url
            : addLeadingSlash(
                (hasPointsTo(tab) ? tab.pointsTo : undefined) ?? tab.slug
              )
        }
        data-state={selected ? "active" : "inactive"}
      >
        <div
          className={cn("flex min-w-0 items-center justify-start space-x-4", {
            "opacity-50": tab.type !== "link" && tab.hidden,
          })}
        >
          <div className="min-w-fit">
            <div className="bg-card-surface ring-border-default group-hover/tab-button:bg-tag-primary group-hover/tab-button:ring-accent/70 group-data-[state=active]/tab-button:bg-accent group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent flex size-6 items-center justify-center rounded-md shadow-sm ring-1 group-data-[state=active]/tab-button:ring-0">
              <FaIcon
                className="text-faded group-hover/tab-button:text-accent group-data-[state=active]/tab-button:text-background group-hover/tab-button:group-data-[state=active]/tab-button:text-background size-4"
                // TODO: Should we validate that the icon is not undefined in sidebar mode
                icon={
                  tab.type !== "link" && tab.authed
                    ? "lock"
                    : (tab.icon ?? "book-open")
                }
              />
            </div>
          </div>
          <span className="truncate font-medium group-data-[state=active]/tab-button:font-semibold">
            {tab.title}
          </span>
        </div>
      </FernLink>
    </li>
  );
};

export const SidebarTabButton = memo(UnmemoizedSidebarTabButton);
