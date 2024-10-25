import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { SidebarTab } from "@fern-ui/fdr-utils";
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

const UnmemoizedSidebarTabButton: React.FC<SidebarTabButton.Props> = ({ tab, selected }) => {
    return (
        <li>
            <FernLink
                className={cn(
                    "min-h-[32px] lg:min-h-[36px]",
                    "text-base lg:text-sm flex flex-1 py-2 lg:px-3 group/tab-button group-hover/tab-button:transition rounded-lg justify-start items-center select-none min-w-0 hover:t-accent",
                    "data-[state=active]:t-accent data-[state=inactive]:t-muted",
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
                        <div className="flex size-6 items-center ring-1 shadow-sm ring-border-default justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:ring-accent/70 bg-card-surface group-data-[state=active]/tab-button:bg-accent group-data-[state=active]/tab-button:ring-0 group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent">
                            <RemoteFontAwesomeIcon
                                className="size-4 bg-faded group-hover/tab-button:bg-accent group-data-[state=active]/tab-button:bg-background group-hover/tab-button:group-data-[state=active]/tab-button:bg-background"
                                // TODO: Should we validate that the icon is not undefined in sidebar mode
                                icon={tab.type !== "tabLink" && tab.authed ? "lock" : (tab.icon ?? "book-open")}
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
