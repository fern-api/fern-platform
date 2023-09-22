import classNames from "classnames";
import { memo } from "react";
import { useSearchContext } from "../search-context/useSearchContext";
import { useSearchService } from "../services/useSearchService";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        hideSearchBar: boolean;
    }
}

const UnmemoizedSidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({ className, hideSearchBar }) => {
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    const showSearchBar = !hideSearchBar && searchService.isAvailable;
    return (
        <div className={classNames("flex flex-col px-4 pt-8 backdrop-blur-sm", className)}>
            {showSearchBar && <SidebarSearchBar onClick={openSearchDialog} />}
        </div>
    );
};

export const SidebarFixedItemsSection = memo(UnmemoizedSidebarFixedItemsSection);
