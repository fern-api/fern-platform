import { ReactElement, memo } from "react";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { Header } from "../../docs/Header";
import { HeaderTabs } from "../../docs/HeaderTabs";

interface HeaderContainerProps {
    className?: string;
}

export const HeaderContainer = memo(function HeaderContainer({ className }: HeaderContainerProps): ReactElement {
    const { layout, tabs } = useDocsContext();

    const showHeaderTabs = tabs.length > 0 && layout?.tabsPlacement === "HEADER" && layout?.disableHeader !== true;

    return (
        <header id="fern-header" className={className}>
            <div className="fern-header-container width-before-scroll-bar">
                <div className="fern-header">
                    <Header
                        className="mx-auto max-w-page-width"
                        showSearchBar={layout?.searchbarPlacement === "HEADER"}
                    />
                </div>
                {showHeaderTabs && (
                    <nav aria-label="tabs" className="fern-header-tabs">
                        <HeaderTabs />
                    </nav>
                )}
            </div>
        </header>
    );
});
