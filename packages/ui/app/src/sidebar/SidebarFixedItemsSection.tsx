import cn from "clsx";
import { useMemo } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { HeaderLogoSection } from "../docs/HeaderLogoSection";
import { ThemeButton } from "../docs/ThemeButton";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
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
    const { layout, colors } = useDocsContext();

    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="mb-3 hidden last:mb-0 lg:block">
                <SidebarSearchBar className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar]);

    if (!showSearchBar) {
        return null;
    }

    const header = layout?.disableHeader && (
        <div className="mx-3 hidden h-header-height-real border-b border-transparent lg:flex lg:items-center lg:justify-between">
            <HeaderLogoSection />
            <div className="-mr-3">{colors.dark && colors.light && <ThemeButton size="large" />}</div>
        </div>
    );

    return (
        <div
            className={cn(
                "flex flex-col px-4",
                {
                    "lg:pt-4": !header,
                },
                className,
            )}
            data-border={showBorder ? "show" : "hide"}
        >
            {header}
            {searchBar}
        </div>
    );
};
