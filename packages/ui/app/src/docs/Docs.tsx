import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";
import { useViewportContext } from "../contexts/viewport-context/useViewportContext";
import { useCreateSearchService, useSearchService } from "../services/useSearchService";
import {
    useCloseMobileSidebar,
    useIsMobileSidebarOpen,
    useMessageHandler,
    useOpenMobileSidebar,
    useOpenSearchDialog,
} from "../sidebar/atom";
import { ColorsConfig, SidebarNavigation } from "../sidebar/types";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { NextNProgress } from "./NProgress";
import { useIsScrolled } from "./useIsScrolled";

const Sidebar = dynamic(() => import("../sidebar/Sidebar").then(({ Sidebar }) => Sidebar), { ssr: true });

interface DocsProps {
    // config: DocsV1Read.DocsConfig;
    hasBackgroundImage: boolean;
    colors: ColorsConfig;
    navbarLinks: DocsV1Read.NavbarLink[];
    layout: DocsV1Read.DocsLayoutConfig | undefined;
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    search: DocsV1Read.SearchInfo;
    navigation: SidebarNavigation;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
    isApiPlaygroundEnabled: boolean;
    isWhiteLabeled: boolean;
}

export const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({
    // config,
    hasBackgroundImage,
    colors,
    layout,
    search,
    navigation,
    algoliaSearchIndex,
    navbarLinks,
    logoHeight,
    logoHref,
    isApiPlaygroundEnabled,
    isWhiteLabeled,
}) {
    const { registerScrolledToPathListener, selectedSlug } = useNavigationContext();
    const openSearchDialog = useOpenSearchDialog();
    const { layoutBreakpoint } = useViewportContext();

    // set up message handler to listen for messages from custom scripts
    useMessageHandler();

    // set up search service
    useCreateSearchService(search, algoliaSearchIndex, navigation);
    const searchService = useSearchService();

    const { resolvedTheme: theme, themes, setTheme } = useTheme();
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });
    useKeyboardPress({
        key: "Slash",
        onPress: () => {
            const activeElementTag = document.activeElement?.tagName.toLowerCase();
            if (activeElementTag !== "input" && activeElementTag !== "textarea" && activeElementTag !== "select") {
                openSearchDialog();
            }
        },
    });

    useEffect(() => {
        // this is a hack to ensure that the theme is always set to a valid value, even if localStorage is corrupted
        if (theme == null || !themes.includes(theme)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setTheme(themes.length === 1 ? themes[0]! : "system");
        }
    }, [setTheme, theme, themes]);

    const isMobileSidebarOpen = useIsMobileSidebarOpen();
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
                    <BgImageGradient
                        className="h-screen opacity-60 dark:opacity-80"
                        colors={colors}
                        hasSpecifiedBackgroundImage={hasBackgroundImage}
                    />
                </div>
            </>
        ),
        [colors, hasBackgroundImage],
    );

    const isScrolled = useIsScrolled();

    const currentSlug = useMemo(() => selectedSlug?.split("/") ?? [], [selectedSlug]);

    return (
        <>
            <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
            <BgImageGradient colors={colors} hasSpecifiedBackgroundImage={hasBackgroundImage} />
            {searchService.isAvailable && <SearchDialog fromHeader={layout?.searchbarPlacement === "HEADER"} />}

            <PlaygroundContextProvider navigation={navigation.sidebarNodes} enabled={isApiPlaygroundEnabled}>
                <div id="docs-content" className="relative flex min-h-0 flex-1 flex-col">
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
                                colors={colors}
                                navbarLinks={navbarLinks}
                                isMobileSidebarOpen={isMobileSidebarOpen}
                                openMobileSidebar={openMobileSidebar}
                                closeMobileSidebar={closeMobileSidebar}
                                showSearchBar={layout?.searchbarPlacement === "HEADER"}
                                navigation={navigation}
                            />
                        </div>
                    </header>

                    <div className="max-w-page-width relative mx-auto flex min-h-0 w-full min-w-0 flex-1">
                        <style>
                            {`
                                .fern-sidebar-container {
                                    border-right-width: ${colors.light?.sidebarBackground == null ? 0 : 1}px;
                                    border-left-width: ${colors.light?.sidebarBackground == null || layout?.pageWidth?.type !== "full" ? 0 : 1}px;
                                }

                                :is(.dark) .fern-sidebar-container {
                                    border-right-width: ${colors.dark?.sidebarBackground == null ? 0 : 1}px;
                                    border-left-width: ${colors.dark?.sidebarBackground == null || layout?.pageWidth?.type !== "full" ? 0 : 1}px;
                                }
                            `}
                        </style>
                        <Sidebar
                            className="fern-sidebar-container w-sidebar-width mt-header-height top-header-height h-vh-minus-header bg-sidebar border-default sticky hidden lg:block"
                            navigation={navigation}
                            currentSlug={currentSlug}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            searchInfo={search}
                            algoliaSearchIndex={algoliaSearchIndex}
                            navbarLinks={navbarLinks}
                            showSearchBar={layout?.searchbarPlacement !== "HEADER"}
                            isWhiteLabeled={isWhiteLabeled}
                        />

                        <main className={classNames("relative flex w-full min-w-0 flex-1 flex-col pt-header-height")}>
                            <DocsMainContent />
                        </main>
                    </div>

                    {/* Enables footer DOM injection */}
                    <footer id="fern-footer" />
                </div>
            </PlaygroundContextProvider>
        </>
    );
});
