import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import NextNProgress from "nextjs-progressbar";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import tinycolor from "tinycolor2";
import { ApiPlaygroundContextProvider } from "../api-playground/ApiPlaygroundContext";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { useSearchService } from "../services/useSearchService";
import {
    useCloseMobileSidebar,
    useIsMobileSidebarOpen,
    useMessageHandler,
    useOpenMobileSidebar,
    useOpenSearchDialog,
} from "../sidebar/atom";
import { SidebarNode } from "../sidebar/types";
import { crawlResolvedNavigationItemApiSections, resolveNavigationItems } from "../util/resolver";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { useIsScrolled } from "./useIsScrolled";

const Sidebar = dynamic(() => import("../sidebar/Sidebar").then(({ Sidebar }) => Sidebar), { ssr: true });

interface DocsProps {
    config: DocsV1Read.DocsConfig;
    search: DocsV1Read.SearchInfo;
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
    navigation: SidebarNode[];
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
}

export const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({
    config,
    search,
    apis,
    navigation,
    algoliaSearchIndex,
}) {
    const { observeDocContent, activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionAndTabSlugs } = useDocsSelectors();
    const openSearchDialog = useOpenSearchDialog();
    const { layoutBreakpoint } = useViewportContext();

    // set up message handler to listen for messages from custom scripts
    useMessageHandler();

    const searchService = useSearchService(search, algoliaSearchIndex);
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

    const hasSpecifiedBackgroundImage = !!config.backgroundImage;

    const { colorsV3, layout } = config;

    const [accentColor, setAccentColor] = useState<string>();
    useEffect(() => {
        if (colorsV3?.type === "darkAndLight") {
            if (theme === "dark" || theme === "light") {
                setAccentColor(tinycolor(colorsV3?.[theme].accentPrimary).toHex8String());
            }
        } else {
            setAccentColor(tinycolor(colorsV3?.accentPrimary).toHex8String());
        }
    }, [colorsV3, theme]);

    const renderBackground = useCallback(
        (className?: string) => (
            <div className={classNames(className, "clipped-background")}>
                <BgImageGradient
                    className="h-screen opacity-60 dark:opacity-80"
                    colors={colorsV3}
                    hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage}
                />
            </div>
        ),
        [colorsV3, hasSpecifiedBackgroundImage],
    );

    const currentSlug = useMemo(
        () =>
            withVersionAndTabSlugs("", { omitDefault: true })
                .split("/")
                .filter((s) => s.length > 0),
        [withVersionAndTabSlugs],
    );

    const navigationItems = useMemo(() => {
        const unresolvedNavigationItems =
            activeNavigationConfigContext?.type === "tabbed"
                ? activeNavigatable?.context.tab?.items
                : activeNavigationConfigContext?.config.items;
        return resolveNavigationItems(unresolvedNavigationItems ?? [], apis, currentSlug);
    }, [
        activeNavigatable?.context.tab?.items,
        activeNavigationConfigContext?.config,
        activeNavigationConfigContext?.type,
        apis,
        currentSlug,
    ]);

    const apiSections = useMemo(() => crawlResolvedNavigationItemApiSections(navigationItems), [navigationItems]);

    const isScrolled = useIsScrolled();

    return (
        <>
            <NextNProgress color={accentColor} options={{ showSpinner: false }} showOnShallow={false} />
            <BgImageGradient colors={colorsV3} hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage} />
            {searchService.isAvailable && (
                <SearchDialog searchService={searchService} fromHeader={layout?.searchbarPlacement === "HEADER"} />
            )}

            <ApiPlaygroundContextProvider navigation={navigation} apiSections={apiSections}>
                <div id="docs-content" className="relative flex min-h-0 flex-1 flex-col" ref={observeDocContent}>
                    <header id="fern-header">
                        <div
                            className="data-[border=show]:border-concealed data-[border=show]:dark:shadow-header-dark h-header-height fixed inset-x-0 top-0 z-30 overflow-visible border-b backdrop-blur-lg transition-[border,shadow] data-[border=hide]:border-transparent lg:backdrop-blur"
                            data-border={
                                isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))
                                    ? "show"
                                    : "hide"
                            }
                        >
                            {renderBackground()}
                            <Header
                                className="max-w-page-width mx-auto"
                                config={config}
                                isMobileSidebarOpen={isMobileSidebarOpen}
                                openMobileSidebar={openMobileSidebar}
                                closeMobileSidebar={closeMobileSidebar}
                                searchService={searchService}
                                showSearchBar={layout?.searchbarPlacement === "HEADER"}
                            />
                        </div>
                    </header>

                    <div className="max-w-page-width relative mx-auto flex min-h-0 w-full min-w-0 flex-1">
                        <Sidebar
                            className="w-sidebar-width mt-header-height top-header-height h-vh-minus-header sticky hidden lg:block"
                            navigation={navigation}
                            currentSlug={currentSlug}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            searchInfo={search}
                            algoliaSearchIndex={algoliaSearchIndex}
                            navbarLinks={config.navbarLinks}
                            searchService={searchService}
                            showSearchBar={layout?.searchbarPlacement !== "HEADER"}
                        />

                        <main className={classNames("relative flex w-full min-w-0 flex-1 flex-col pt-header-height")}>
                            <DocsMainContent navigationItems={navigationItems} />
                        </main>
                    </div>

                    {/* Enables footer DOM injection */}
                    <footer id="fern-footer" />
                </div>
            </ApiPlaygroundContextProvider>
        </>
    );
});
