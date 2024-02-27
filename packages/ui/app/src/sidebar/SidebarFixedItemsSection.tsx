import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useMemo } from "react";
import { useOpenSearchDialog } from "./atom";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        searchInfo: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        showBorder?: boolean;
        showSearchBar?: boolean;
        currentTabIndex?: number | undefined;
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({
    className,
    showBorder,
    showSearchBar,
}) => {
    const openSearchDialog = useOpenSearchDialog();

    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="mb-3 hidden last:mb-0 lg:block">
                <SidebarSearchBar onClick={openSearchDialog} className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar, openSearchDialog]);

    if (!showSearchBar) {
        return null;
    }

    return (
        <div
            className={classNames(
                "flex flex-col px-4 lg:pt-4 lg:backdrop-blur",
                // {
                //     "border-b data-[border=show]:border-concealed data-[border=hide]:border-transparent": tabs != null,
                // },
                // {
                //     "py-4 lg:pb-2": tabs != null,
                // },
                className,
            )}
            data-border={showBorder ? "show" : "hide"}
        >
            {searchBar}

            {/* <div className="from-background dark:from-background-dark absolute inset-x-0 top-full -ml-4 mt-px h-8 bg-gradient-to-b" /> */}
        </div>
    );
};
