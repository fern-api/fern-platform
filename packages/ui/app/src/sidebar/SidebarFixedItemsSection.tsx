import { DOCS_LAYOUT_ATOM, SHOW_SEARCH_BAR_IN_SIDEBAR_ATOM, THEME_SWITCH_ENABLED_ATOM } from "@/atoms";
import cn from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { HeaderLogoSection } from "../docs/HeaderLogoSection";
import { ThemeButton } from "../docs/ThemeButton";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        showBorder?: boolean;
        currentTabIndex?: number | undefined;
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({ className, showBorder }) => {
    const showSearchBar = useAtomValue(SHOW_SEARCH_BAR_IN_SIDEBAR_ATOM);
    const themeSwitchEnabled = useAtomValue(THEME_SWITCH_ENABLED_ATOM);
    const layout = useAtomValue(DOCS_LAYOUT_ATOM);

    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="fern-sidebar-searchbar-container">
                <SidebarSearchBar className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar]);

    if (!showSearchBar) {
        return null;
    }

    const header = layout?.disableHeader && (
        <div className="fern-sidebar-header">
            <HeaderLogoSection />
            <div className="-mr-3">{themeSwitchEnabled && <ThemeButton size="large" />}</div>
        </div>
    );

    return (
        <div
            className={cn("flex flex-col px-4", { "lg:pt-4": !header }, className)}
            data-border={showBorder ? "show" : "hide"}
        >
            {header}
            {searchBar}
        </div>
    );
};
