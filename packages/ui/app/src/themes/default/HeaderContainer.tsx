import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { HAS_HORIZONTAL_TABS, MOBILE_SIDEBAR_ENABLED_ATOM, useColors, useIsMobileSidebarOpen } from "../../atoms";
import { BgImageGradient } from "../../components/BgImageGradient";
import { Announcement } from "../../header/Announcement";
import { Header } from "../../header/Header";
import { HeaderTabs } from "../../header/HeaderTabs";
import { useIsScrolled } from "../../hooks/useIsScrolled";

interface HeaderContainerProps {
    className?: string;
}

export function HeaderContainer({ className }: HeaderContainerProps): ReactElement {
    const colors = useColors();
    const showHeaderTabs = useAtomValue(HAS_HORIZONTAL_TABS);
    const isScrolled = useIsScrolled();
    const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
    const isMobileSidebarOpen = useIsMobileSidebarOpen();

    return (
        <header id="fern-header" className={className} role="banner">
            <Announcement />
            <div
                className={clsx("fern-header-container width-before-scroll-bar", {
                    "has-background-light": colors.light?.headerBackground != null,
                    "has-background-dark": colors.dark?.headerBackground != null,
                })}
                data-border={isScrolled || (isMobileSidebarOpen && isMobileSidebarEnabled) ? "show" : "hide"}
            >
                <div className="clipped-background">
                    <BgImageGradient className="h-screen opacity-60 dark:opacity-80" />
                </div>
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
}
