import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import classNames from "classnames";
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

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    useCustomTheme(docsDefinition);
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    const { isMobileSidebarOpen, openMobileSidebar, closeMobileSidebar } = useMobileSidebarContext();

    const hasSpecifiedBackgroundColor = !!docsDefinition.config.colorsV2?.background;
    const hasSpecifiedBackgroundImage = !!docsDefinition.config.backgroundImage;

    return (
        <div
            className={classNames("relative flex min-h-0 flex-1 bg-background flex-col bg-fixed", {
                "from-accent-primary/10 dark:from-accent-primary/[0.15] overscroll-y-none bg-gradient-to-b to-transparent":
                    !hasSpecifiedBackgroundColor && !hasSpecifiedBackgroundImage,
            })}
            style={
                hasSpecifiedBackgroundImage
                    ? {
                          backgroundImage: "var(--docs-background-image)",
                          backgroundSize: "cover",
                      }
                    : {}
            }
        >
            {/* <div className=""></div> */}
            {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
            <div className="border-border-default-light dark:border-border-default-dark sticky inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-xl">
                <Header className="max-w-8xl mx-auto" />
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
    );
});
