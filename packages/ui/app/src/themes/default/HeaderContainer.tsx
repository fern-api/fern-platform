import cn, { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, useCallback } from "react";
import { useIsMobileSidebarOpen } from "../../atoms/sidebar";
import { MOBILE_SIDEBAR_ENABLED_ATOM } from "../../atoms/viewport";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { BgImageGradient } from "../../docs/BgImageGradient";
import { Header } from "../../docs/Header";
import { HeaderTabs } from "../../docs/HeaderTabs";
import { useIsScrolled } from "../../docs/useIsScrolled";

interface HeaderContainerProps {
    className?: string;
}

export function HeaderContainer({ className }: HeaderContainerProps): ReactElement {
    const { colors, layout, tabs } = useDocsContext();
    const isScrolled = useIsScrolled();
    const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
    const isMobileSidebarOpen = useIsMobileSidebarOpen();

    const renderBackground = useCallback(
        (className?: string) => (
            <>
                <style>
                    {`
                        .clipped-background {
                            opacity: ${colors.light?.headerBackground != null ? 0 : 1};
                        }

                        :is(.dark) .clipped-background {
                            opacity: ${colors.dark?.headerBackground != null ? 0 : 1};
                        }
                    `}
                </style>
                <div className={cn(className, "clipped-background")}>
                    <BgImageGradient className="h-screen opacity-60 dark:opacity-80" />
                </div>
            </>
        ),
        [colors],
    );

    return (
        <header id="fern-header" className={className}>
            <div
                className={clsx("fern-header-container width-before-scroll-bar", {
                    "has-background-light": colors.light?.headerBackground != null,
                    "has-background-dark": colors.dark?.headerBackground != null,
                })}
                data-border={isScrolled || (isMobileSidebarOpen && isMobileSidebarEnabled) ? "show" : "hide"}
            >
                <div className="fern-header">
                    {renderBackground()}
                    <Header
                        className="mx-auto max-w-page-width"
                        showSearchBar={layout?.searchbarPlacement === "HEADER"}
                    />
                </div>
                {tabs.length > 0 && layout?.tabsPlacement === "HEADER" && layout?.disableHeader !== true && (
                    <nav aria-label="tabs" className="fern-header-tabs">
                        {renderBackground()}
                        <HeaderTabs />
                    </nav>
                )}
            </div>
        </header>
    );
}
