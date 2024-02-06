import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useMemo } from "react";
import { useNavigationContext } from "../navigation-context";
import { useSearchContext } from "../search-context/useSearchContext";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { useSearchService } from "../services/useSearchService";
import { SidebarSearchBar } from "./SidebarSearchBar";
import { SidebarTabButton } from "./SidebarTabButton";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        searchInfo: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({
    className,
    searchInfo,
    algoliaSearchIndex,
}) => {
    const { activeNavigatable } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionSlug } = useDocsSelectors();
    const { openSearchDialog } = useSearchContext();
    const showTabs = activeNavigationConfigContext.type === "tabbed";

    const showSearchBar = useSearchService(searchInfo, algoliaSearchIndex).isAvailable;
    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="hidden lg:block">
                <SidebarSearchBar onClick={openSearchDialog} className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar, openSearchDialog]);

    const tabs = useMemo(() => {
        if (!showTabs) {
            return null;
        }
        return (
            <ul className="mt-3 flex list-none flex-col">
                {activeNavigationConfigContext.config.tabs.map((tab, idx) => (
                    <SidebarTabButton
                        key={idx}
                        tab={tab}
                        selected={idx === activeNavigatable.context.tab?.index}
                        slug={withVersionSlug(tab.urlSlug, { omitDefault: true })}
                    />
                ))}
            </ul>
        );
    }, [showTabs, activeNavigationConfigContext, activeNavigatable, withVersionSlug]);

    if (!showSearchBar && !showTabs) {
        return null;
    }

    return (
        <div
            className={classNames(
                "flex flex-col px-4 lg:pt-4 lg:backdrop-blur lg:bg-background/70 dark:lg:bg-background-dark/60",
                {
                    "border-b border-border-concealed-light dark:border-border-concealed-dark": tabs != null,
                },
                {
                    "py-4 lg:pb-2": tabs != null,
                },
                className,
            )}
        >
            {searchBar}
            {tabs}

            <div className="from-background dark:from-background-dark absolute inset-x-0 top-full -ml-4 mt-px h-8 bg-gradient-to-b" />
        </div>
    );
};
