import { SidebarTab } from "@fern-ui/fdr-utils";
import cn from "clsx";
import { memo } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernLink } from "../components/FernLink";

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
                href={tab.type === "tabGroup" ? `/${tab.slug.join("/")}` : tab.url}
                data-state={selected ? "active" : "inactive"}
            >
                <div className="flex min-w-0 items-center justify-start space-x-4 lg:space-x-3">
                    <div className="min-w-fit">
                        <div
                            className={cn(
                                "flex size-6 items-center border border-default justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-accent-muted",
                                "bg-card group-data-[state=active]/tab-button:bg-accent group-data-[state=active]/tab-button:border-transparent group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent",
                            )}
                        >
                            <RemoteFontAwesomeIcon
                                className="size-3.5 bg-text-muted group-hover/tab-button:bg-accent group-data-[state=active]/tab-button:bg-background group-hover/tab-button:group-data-[state=active]/tab-button:bg-background"
                                // TODO: Should we validate that the icon is not undefined in sidebar mode
                                icon={tab.icon ?? "book-open"}
                            />
                        </div>
                    </div>
                    <span className="truncate font-medium">{tab.title}</span>
                </div>
            </FernLink>
        </li>
    );
};

export const SidebarTabButton = memo(UnmemoizedSidebarTabButton);
