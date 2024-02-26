import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useMemo } from "react";
import { useOpenSearchDialog } from "./atom";
import { SidebarSearchBar } from "./SidebarSearchBar";
import { SidebarTabButton } from "./SidebarTabButton";
import { SidebarNavigation } from "./types";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        searchInfo: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
        showBorder?: boolean;
        showSearchBar?: boolean;
        currentTabIndex?: number | null;
        tabs: SidebarNavigation["tabs"];
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({
    className,
    showBorder,
    showSearchBar,
    currentTabIndex,
    tabs,
}) => {
    const openSearchDialog = useOpenSearchDialog();

    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="mb-3 hidden last:mb-0 lg:block">
                <SidebarSearchBar onClick={openSearchDialog} className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar, openSearchDialog]);

    const renderedTabs = useMemo(() => {
        if (tabs.length === 0) {
            return null;
        }
        return (
            <ul className="flex list-none flex-col">
                {tabs.map((tab, idx) => (
                    <SidebarTabButton key={idx} tab={tab} selected={idx === currentTabIndex} slug={tab.urlSlug} />
                ))}
            </ul>
        );
    }, [tabs, currentTabIndex]);

    if (!showSearchBar && tabs.length === 0) {
        return null;
    }

    return (
        <div
            className={classNames(
                "flex flex-col px-4 lg:pt-4 lg:backdrop-blur",
                {
                    "border-b data-[border=show]:border-concealed data-[border=hide]:border-transparent": tabs != null,
                },
                {
                    "py-4 lg:pb-2": tabs != null,
                },
                className,
            )}
            data-border={showBorder ? "show" : "hide"}
        >
            {searchBar}
            {renderedTabs}

            {/* <div className="from-background dark:from-background-dark absolute inset-x-0 top-full -ml-4 mt-px h-8 bg-gradient-to-b" /> */}
        </div>
    );
};
