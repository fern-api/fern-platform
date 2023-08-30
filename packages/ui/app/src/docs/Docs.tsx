import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    useCustomTheme(docsDefinition);
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    const { isMobileSidebarOpen } = useMobileSidebarContext();

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
            <div className="border-border-default-light dark:border-border-default-dark bg-background sticky inset-x-0 top-0 z-20 border-b">
                <Header className="max-w-8xl mx-auto" />
            </div>
            <div className="mx-auto flex min-h-0 flex-1">
                <div className="hidden w-64 md:flex">
                    <Sidebar />
                </div>
                {isMobileSidebarOpen && (
                    <div className="bg-background absolute inset-x-0 bottom-0 top-16 z-10 flex md:hidden">
                        <Sidebar hideSearchBar />
                    </div>
                )}
                <div className="flex min-w-0 max-w-[calc(theme(maxWidth.8xl)-theme(spacing.64))] flex-1 flex-col">
                    <DocsMainContent />
                </div>
            </div>
        </div>
    );
};
