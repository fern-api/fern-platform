import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import { useTheme } from "@fern-ui/theme";
import { memo, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { Sidebar } from "../sidebar/Sidebar";
import { BgImageGradient } from "./BgImageGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = memo(function UnmemoizedDocs() {
    const docsContext = useDocsContext();
    const { docsDefinition } = docsContext;
    const searchContext = useSearchContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = searchContext;
    const searchService = useSearchService();
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    const themeStyledCss = useCustomTheme(docsDefinition);

    const { isMobileSidebarOpen, openMobileSidebar, closeMobileSidebar } = useMobileSidebarContext();

    const hasSpecifiedBackgroundImage = !!docsDefinition.config.backgroundImage;

    const { colorsV3 } = docsDefinition.config;

    const { theme } = useTheme(colorsV3.type);

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

    return (
        <>
            {themeStyledCss}
            <BgImageGradient
                backgroundType={backgroundType}
                hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage}
            />
            <div className="relative flex min-h-0 flex-1 flex-col">
                {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
                <div className="border-border-default-light dark:border-border-default-dark sticky inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-xl">
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

                <div className="max-w-8xl mx-auto flex min-h-0 w-full flex-1">
                    <div className="hidden w-72 md:flex">
                        <div
                            className="sticky top-16 w-full overflow-auto overflow-x-hidden"
                            style={{ maxHeight: "calc(100vh - 4rem)" }}
                            id="sidebar-container"
                        >
                            <Sidebar />
                        </div>
                    </div>
                    {isMobileSidebarOpen && (
                        <div
                            className="bg-background fixed inset-x-0 bottom-0 top-16 z-10 flex overflow-auto overflow-x-hidden md:hidden"
                            style={{ maxHeight: "calc(100vh - 4rem)" }}
                        >
                            <Sidebar hideSearchBar />
                        </div>
                    )}
                    <div className="flex w-full min-w-0 flex-1 flex-col">
                        <DocsMainContent />
                    </div>
                </div>
            </div>
        </>
    );
});
