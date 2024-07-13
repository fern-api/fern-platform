import { HAS_HORIZONTAL_TABS } from "@/atoms";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { Header } from "../../docs/Header";
import { HeaderTabs } from "../../docs/HeaderTabs";

interface HeaderContainerProps {
    className?: string;
}

export const HeaderContainer = memo(function HeaderContainer({ className }: HeaderContainerProps): ReactElement {
    const showHeaderTabs = useAtomValue(HAS_HORIZONTAL_TABS);

    return (
        <header id="fern-header" className={className}>
            <div className="fern-header-container width-before-scroll-bar">
                <div className="fern-header">
                    <Header className="mx-auto max-w-page-width" />
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
