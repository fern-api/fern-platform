import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import { useDocsContext } from "../docs-context/useDocsContext";
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

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
            <div className="border-border-default-light dark:border-border-default-dark bg-background sticky inset-x-0 top-0 z-20 border-b">
                <Header />
            </div>
            <div className="flex min-h-0 flex-1">
                <div className="hidden w-64 md:flex">
                    <Sidebar />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <DocsMainContent />
                </div>
            </div>
        </div>
    );
};
