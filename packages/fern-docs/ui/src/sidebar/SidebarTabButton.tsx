import { RemoteFontAwesomeIcon } from "@fern-docs/components";
import { SidebarTab } from "@fern-platform/fdr-utils";
import cn, { clsx } from "clsx";
import { memo } from "react";
import { FernLink } from "../components/FernLink";
import { useSidebarTabHref } from "../hooks/useSidebarTabHref";

export declare namespace SidebarTabButton {
  export interface Props {
    tab: SidebarTab;
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
          "min-h-[32px] lg:min-h-[36px]",
          "group/tab-button flex min-w-0 flex-1 select-none items-center justify-start rounded-lg py-2 text-base hover:t-accent group-hover/tab-button:transition lg:px-3 lg:text-sm",
          "data-[state=inactive]:t-muted data-[state=active]:t-accent"
        )}
        href={useSidebarTabHref(tab)}
        data-state={selected ? "active" : "inactive"}
      >
        <div
          className={clsx("flex min-w-0 items-center justify-start space-x-4", {
            "opacity-50": tab.type !== "tabLink" && tab.hidden,
          })}
        >
          <div className="min-w-fit">
            <div className="bg-card-surface flex size-6 items-center justify-center rounded-md shadow-sm ring-1 ring-border-default group-hover/tab-button:bg-tag-primary group-hover/tab-button:ring-accent/70 group-data-[state=active]/tab-button:bg-accent group-data-[state=active]/tab-button:ring-0 group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent">
              <RemoteFontAwesomeIcon
                className="size-4 bg-faded group-hover/tab-button:bg-accent group-data-[state=active]/tab-button:bg-background group-hover/tab-button:group-data-[state=active]/tab-button:bg-background"
                // TODO: Should we validate that the icon is not undefined in sidebar mode
                icon={
                  tab.type !== "tabLink" && tab.authed
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
