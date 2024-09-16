import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { HAS_HORIZONTAL_TABS, SEARCHBAR_PLACEMENT_ATOM } from "../../atoms";
import { Header } from "../../header/Header";
import { HeaderTabs } from "../../header/HeaderTabs";
import { SidebarSearchBar } from "../../sidebar/SidebarSearchBar";

interface HeaderContainerProps {
    className?: string;
}

export const HeaderContainer = memo(function HeaderContainer({ className }: HeaderContainerProps): ReactElement {
    const showHeaderTabs = useAtomValue(HAS_HORIZONTAL_TABS);
    const showSearchBar = useAtomValue(SEARCHBAR_PLACEMENT_ATOM) === "HEADER_TABS";

    return (
        <header id="fern-header" className={className}>
            <div className="fern-header-container width-before-scroll-bar">
                <div className="fern-header">
                    <Header className="max-w-page-width mx-auto" />
                </div>
                {showHeaderTabs && (
                    <nav aria-label="tabs" className="fern-header-tabs">
                        <HeaderTabs />

                        {showSearchBar && <SidebarSearchBar className="w-96 shrink" />}
                    </nav>
                )}
            </div>
        </header>
    );
});
