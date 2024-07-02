import { DocsV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { FC, useCallback } from "react";
import { useCloseMobileSidebar, useOpenMobileSidebar } from "../atoms/sidebar";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpointValue } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
import { BgImageGradient } from "./BgImageGradient";
import { Header } from "./Header";
import { HeaderTabs } from "./HeaderTabs";
import { useIsScrolled } from "./useIsScrolled";

interface HeaderContainerProps {
    isMobileSidebarOpen: boolean;
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
}

export const HeaderContainer: FC<HeaderContainerProps> = ({ isMobileSidebarOpen, logoHeight, logoHref }) => {
    const { colors, layout, tabs, navbarLinks } = useDocsContext();
    const isScrolled = useIsScrolled();
    const layoutBreakpoint = useLayoutBreakpointValue();
    const openMobileSidebar = useOpenMobileSidebar();
    const closeMobileSidebar = useCloseMobileSidebar();

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
        <header id="fern-header">
            <div
                className="fern-header-container width-before-scroll-bar"
                data-border={
                    isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))
                        ? "show"
                        : "hide"
                }
            >
                <div className="bg-header border-concealed h-header-height-real border-b">
                    {renderBackground()}
                    <Header
                        className="mx-auto max-w-page-width"
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                        navbarLinks={navbarLinks}
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        openMobileSidebar={openMobileSidebar}
                        closeMobileSidebar={closeMobileSidebar}
                        showSearchBar={layout?.searchbarPlacement === "HEADER"}
                    />
                </div>
                {tabs.length > 0 && layout?.tabsPlacement === "HEADER" && layout?.disableHeader !== true && (
                    <HeaderTabs />
                )}
            </div>
        </header>
    );
};
