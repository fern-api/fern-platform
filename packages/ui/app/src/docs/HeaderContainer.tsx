import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { FC, useCallback } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useViewportContext } from "../contexts/viewport-context/useViewportContext";
import { useCloseMobileSidebar, useOpenMobileSidebar } from "../sidebar/atom";
import { BgImageGradient } from "./BgImageGradient";
import { Header } from "./Header";
import { useIsScrolled } from "./useIsScrolled";

interface HeaderContainerProps {
    isMobileSidebarOpen: boolean;
    navbarLinks: DocsV1Read.NavbarLink[];
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
}

export const HeaderContainer: FC<HeaderContainerProps> = ({
    isMobileSidebarOpen,
    navbarLinks,
    logoHeight,
    logoHref,
}) => {
    const { colors, layout } = useDocsContext();
    const isScrolled = useIsScrolled();
    const { layoutBreakpoint } = useViewportContext();
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
                <div className={classNames(className, "clipped-background")}>
                    <BgImageGradient className="h-screen opacity-60 dark:opacity-80" colors={colors} />
                </div>
            </>
        ),
        [colors],
    );
    return (
        <header id="fern-header">
            <div
                className="bg-header border-concealed data-[border=show]:dark:shadow-header-dark h-header-height fixed inset-x-0 top-0 z-30 overflow-visible border-b shadow-none backdrop-blur-lg transition-shadow lg:backdrop-blur"
                data-border={
                    isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))
                        ? "show"
                        : "hide"
                }
            >
                {renderBackground()}
                <Header
                    className="max-w-page-width mx-auto"
                    logoHeight={logoHeight}
                    logoHref={logoHref}
                    navbarLinks={navbarLinks}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    openMobileSidebar={openMobileSidebar}
                    closeMobileSidebar={closeMobileSidebar}
                    showSearchBar={layout?.searchbarPlacement === "HEADER"}
                />
            </div>
        </header>
    );
};
