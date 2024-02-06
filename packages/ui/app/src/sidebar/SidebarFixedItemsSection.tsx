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
    const searchService = useSearchService(searchInfo, algoliaSearchIndex);

    const showSearchBar = searchService.isAvailable;
    const showTabs = activeNavigationConfigContext.type === "tabbed";

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
                "flex flex-col px-4 lg:pt-8 lg:backdrop-blur",
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
        </div>
    );
};
