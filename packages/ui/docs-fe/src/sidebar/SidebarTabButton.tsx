import { SidebarTab } from "@fern-platform/fdr-utils";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import clsx from "clsx";
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
                className={clsx(
                    "min-h-[32px] lg:min-h-[36px]",
                    "group/tab-button hover:t-accent flex min-w-0 flex-1 select-none items-center justify-start rounded-lg py-2 text-base group-hover/tab-button:transition lg:px-3 lg:text-sm",
                    "data-[state=active]:t-accent data-[state=inactive]:t-muted",
                )}
                href={useSidebarTabHref(tab)}
                data-state={selected ? "active" : "inactive"}
            >
                <div className="flex min-w-0 items-center justify-start space-x-4">
                    <div className="min-w-fit">
                        <div className="ring-border-default group-hover/tab-button:bg-tag-primary group-hover/tab-button:ring-accent/70 bg-card-surface group-data-[state=active]/tab-button:bg-accent group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent flex size-6 items-center justify-center rounded-md shadow-sm ring-1 group-data-[state=active]/tab-button:ring-0">
                            <RemoteFontAwesomeIcon
                                className="bg-faded group-hover/tab-button:bg-accent group-data-[state=active]/tab-button:bg-background group-hover/tab-button:group-data-[state=active]/tab-button:bg-background size-4"
                                // TODO: Should we validate that the icon is not undefined in sidebar mode
                                icon={tab.icon ?? "book-open"}
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
