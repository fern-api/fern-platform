import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import classNames from "classnames";
import { memo, useMemo } from "react";
import { HEADER_HEIGHT } from "../constants";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { NavigationStatus } from "../navigation-context/NavigationContext";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { Sidebar } from "../sidebar/Sidebar";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";

export const Docs: React.FC = memo(function UnmemoizedDocs() {
    const { navigation } = useNavigationContext();
    const docsContext = useDocsContext();
    const { docsDefinition, docsInfo, theme } = docsContext;
    const searchContext = useSearchContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = searchContext;
    const searchService = useSearchService();
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    const { isMobileSidebarOpen, openMobileSidebar, closeMobileSidebar } = useMobileSidebarContext();

    const hasSpecifiedBackgroundImage = !!docsDefinition.config.backgroundImage;

    const { colorsV3 } = docsDefinition.config;

    const backgroundType = useMemo(() => {
        if (theme == null) {
            return null;
        }
        if (colorsV3.type === "darkAndLight") {
            return colorsV3[theme].background.type;
        } else {
            return colorsV3.background.type;
        }
    }, [colorsV3, theme]);

    const hideContent =
        navigation.status === NavigationStatus.NIL ||
        navigation.status === NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR;

    return (
        <>
            <BgImageGradient
                backgroundType={backgroundType}
                hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage}
            />
            {searchService.isAvailable && (
                <SearchDialog
                    isOpen={isSearchDialogOpen}
                    onClose={closeSearchDialog}
                    activeVersion={docsInfo.type === "versioned" ? docsInfo.activeVersionName : undefined}
                    searchService={searchService}
                />
            )}

            <div className="relative flex min-h-0 flex-1 flex-col">
                <div
                    className="border-border-concealed-light dark:border-border-concealed-dark bg-background/50 dark:shadow-header sticky inset-x-0 top-0 z-20 border-b backdrop-blur-xl"
                    style={{ height: HEADER_HEIGHT }}
                >
                    <Header
                        className="max-w-8xl mx-auto"
                        docsDefinition={docsDefinition}
                        openSearchDialog={openSearchDialog}
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        openMobileSidebar={openMobileSidebar}
                        closeMobileSidebar={closeMobileSidebar}
                        searchService={searchService}
                    />
                </div>

                <div className="max-w-8xl relative mx-auto flex min-h-0 w-full flex-1">
                    <div className="hidden w-72 md:flex">
                        <div
                            className="sticky top-16 w-full overflow-auto overflow-x-hidden"
                            style={{ maxHeight: "calc(100vh - 4rem)", opacity: hideContent ? 0 : undefined }}
                            id="sidebar-container"
                        >
                            <Sidebar />
                        </div>
                    </div>
                    {isMobileSidebarOpen && (
                        <div
                            className="bg-background fixed inset-x-0 bottom-0 top-16 z-10 flex overflow-auto overflow-x-hidden md:hidden"
                            style={{ maxHeight: "calc(100vh - 4rem)", opacity: hideContent ? 0 : undefined }}
                        >
                            <Sidebar hideSearchBar />
                        </div>
                    )}

                    <div
                        className={classNames("relative flex w-full min-w-0 flex-1 flex-col", {
                            "opacity-0": hideContent,
                        })}
                    >
                        <DocsMainContent />
                    </div>
                </div>
            </div>
        </>
    );
});
