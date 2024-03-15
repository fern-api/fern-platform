import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { memo, useEffect, useMemo } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";
import { useViewportContext } from "../contexts/viewport-context/useViewportContext";
import { useCreateSearchService, useSearchService } from "../services/useSearchService";
import { useIsMobileSidebarOpen, useMessageHandler, useOpenSearchDialog } from "../sidebar/atom";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { HeaderContainer } from "./HeaderContainer";

const Sidebar = dynamic(() => import("../sidebar/Sidebar").then(({ Sidebar }) => Sidebar), { ssr: true });

interface DocsProps {
    navbarLinks: DocsV1Read.NavbarLink[];
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    search: DocsV1Read.SearchInfo;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
}

export const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({
    search,
    algoliaSearchIndex,
    navbarLinks,
    logoHeight,
    logoHref,
}) {
    const { layout, colors } = useDocsContext();
    const { registerScrolledToPathListener, selectedSlug, navigation } = useNavigationContext();
    const openSearchDialog = useOpenSearchDialog();

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

    const currentSlug = useMemo(() => selectedSlug?.split("/") ?? [], [selectedSlug]);
    const { layoutBreakpoint } = useViewportContext();

    return (
        <>
            <BgImageGradient colors={colors} />
            {searchService.isAvailable && <SearchDialog fromHeader={layout?.searchbarPlacement === "HEADER"} />}

            <PlaygroundContextProvider navigation={navigation.sidebarNodes}>
                <div id="docs-content" className="relative flex min-h-0 flex-1 flex-col">
                    {(layout?.disableHeader !== true || ["mobile", "sm", "md"].includes(layoutBreakpoint)) && (
                        <HeaderContainer
                            isMobileSidebarOpen={isMobileSidebarOpen}
                            navbarLinks={navbarLinks}
                            logoHeight={logoHeight}
                            logoHref={logoHref}
                        />
                    )}

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
                            className={
                                layout?.disableHeader !== true
                                    ? "fern-sidebar-container w-sidebar-width mt-header-height top-header-height h-vh-minus-header bg-sidebar border-concealed sticky hidden lg:block"
                                    : "fern-sidebar-container w-sidebar-width h-vh-minus-header bg-sidebar border-concealed fixed hidden lg:block"
                            }
                            navigation={navigation}
                            currentSlug={currentSlug}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            searchInfo={search}
                            algoliaSearchIndex={algoliaSearchIndex}
                            navbarLinks={navbarLinks}
                            logoHeight={logoHeight}
                            logoHref={logoHref}
                            showSearchBar={layout?.disableHeader || layout?.searchbarPlacement !== "HEADER"}
                        />
                        {layout?.disableHeader && <div className="w-sidebar-width hidden lg:block" />}

                        <main className="fern-main">
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
