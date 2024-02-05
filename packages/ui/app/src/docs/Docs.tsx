import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { crawlResolvedNavigationItemApiSections, resolveNavigationItems } from "@fern-ui/app-utils";
import { PLATFORM, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { useTheme } from "next-themes";
import NextNProgress from "nextjs-progressbar";
import { memo, useEffect, useMemo, useState } from "react";
import tinycolor from "tinycolor2";
import { ApiPlaygroundContextProvider } from "../api-playground/ApiPlaygroundContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { useSearchService } from "../services/useSearchService";
import { Sidebar } from "../sidebar/Sidebar";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";

interface DocsProps {
    config: DocsV1Read.DocsConfig;
    search: DocsV1Read.SearchInfo;
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
}

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({
    config,
    search,
    apis,
    algoliaSearchIndex,
}) {
    const { observeDocContent, activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionAndTabSlugs } = useDocsSelectors();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();

    const searchService = useSearchService(search, algoliaSearchIndex);
    const { resolvedTheme: theme, themes, setTheme } = useTheme();
    useEffect(() => {
        document.body.className = theme === "dark" ? "antialiased bp5-dark" : "antialiased";
    });
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });
    useKeyboardPress({
        key: "Slash",
        onPress: (e) => {
            if (e.target == null || e.target === document.body) {
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

    const { isMobileSidebarOpen, openMobileSidebar, closeMobileSidebar } = useMobileSidebarContext();

    const hasSpecifiedBackgroundImage = !!config.backgroundImage;

    const { colorsV3, layout } = config;

    const backgroundType = useMemo(() => {
        if (colorsV3?.type === "darkAndLight") {
            if (theme === "dark" || theme === "light") {
                return colorsV3?.[theme].background.type;
            }
            return undefined;
        } else {
            return colorsV3?.background.type;
        }
    }, [colorsV3, theme]);

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

    const currentSlug = useMemo(
        () =>
            withVersionAndTabSlugs("", { omitDefault: true })
                .split("/")
                .filter((s) => s.length > 0),
        [withVersionAndTabSlugs],
    );

    const navigationItems = useMemo(() => {
        const unresolvedNavigationItems =
            activeNavigationConfigContext.type === "tabbed"
                ? activeNavigatable.context.tab?.items
                : activeNavigationConfigContext.config.items;
        return resolveNavigationItems(unresolvedNavigationItems ?? [], apis, currentSlug);
    }, [
        activeNavigatable.context.tab?.items,
        activeNavigationConfigContext.config,
        activeNavigationConfigContext.type,
        apis,
        currentSlug,
    ]);

    const apiSections = useMemo(() => crawlResolvedNavigationItemApiSections(navigationItems), [navigationItems]);

    const maxPageWidth =
        layout?.pageWidth == null
            ? "88rem"
            : visitDiscriminatedUnion(layout.pageWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  full: () => undefined,
                  _other: () => "88rem",
              });

    const { layoutBreakpoint } = useViewportContext();

    return (
        <>
            <NextNProgress color={accentColor} options={{ showSpinner: false }} showOnShallow={false} />
            <BgImageGradient
                backgroundType={backgroundType}
                hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage}
            />
            {searchService.isAvailable && (
                <SearchDialog
                    isOpen={isSearchDialogOpen}
                    onClose={closeSearchDialog}
                    activeVersion={activeNavigatable.context.version?.info.id}
                    searchService={searchService}
                />
            )}

            <ApiPlaygroundContextProvider apiSections={apiSections}>
                <div id="docs-content" className="relative flex min-h-0 flex-1 flex-col" ref={observeDocContent}>
                    <div
                        className="fixed inset-x-0 top-0 z-30 mx-auto overflow-visible"
                        style={{
                            maxWidth: maxPageWidth,
                        }}
                    >
                        <Header
                            className="m-3 h-[50px] rounded-lg border border-[#E0E0E0] bg-[#FAFAFA]"
                            style={{
                                maxWidth: maxPageWidth,
                            }}
                            config={config}
                            openSearchDialog={openSearchDialog}
                            isMobileSidebarOpen={isMobileSidebarOpen}
                            openMobileSidebar={openMobileSidebar}
                            closeMobileSidebar={closeMobileSidebar}
                            searchService={searchService}
                        />
                    </div>

                    <div
                        className="relative mx-auto flex min-h-0 w-full min-w-0 flex-1"
                        style={{
                            maxWidth: maxPageWidth,
                        }}
                    >
                        {isMobileSidebarOpen && (
                            <div
                                className="fixed inset-0 z-20 block bg-[#E9E6DE]/60 lg:hidden dark:bg-black/40"
                                onClick={closeMobileSidebar}
                            />
                        )}
                        {["lg", "xl", "2xl"].includes(layoutBreakpoint) ? (
                            <div
                                className="sticky top-[74px] z-20 m-3 mt-[74px] hidden h-[calc(100vh-86px)] overflow-hidden rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] lg:block"
                                style={{
                                    width:
                                        layout?.sidebarWidth == null
                                            ? "18rem"
                                            : visitDiscriminatedUnion(layout.sidebarWidth, "type")._visit({
                                                  px: (px) => `${px.value}px`,
                                                  rem: (rem) => `${rem.value}rem`,
                                                  _other: () => "18rem",
                                              }),
                                }}
                            >
                                <Sidebar
                                    navigationItems={navigationItems}
                                    currentSlug={currentSlug}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    searchInfo={search}
                                    algoliaSearchIndex={algoliaSearchIndex}
                                    navbarLinks={config.navbarLinks}
                                />
                            </div>
                        ) : (
                            <Transition
                                className="fixed inset-3 top-[74px] z-20 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] sm:w-72"
                                show={isMobileSidebarOpen}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Sidebar
                                    navigationItems={navigationItems}
                                    currentSlug={currentSlug}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    searchInfo={search}
                                    algoliaSearchIndex={algoliaSearchIndex}
                                    navbarLinks={config.navbarLinks}
                                />
                            </Transition>
                        )}

                        <main className={classNames("relative flex w-full min-w-0 flex-1 flex-col mt-[74px]")}>
                            <DocsMainContent navigationItems={navigationItems} contentWidth={layout?.contentWidth} />
                        </main>
                    </div>
                </div>
            </ApiPlaygroundContextProvider>
        </>
    );
});
