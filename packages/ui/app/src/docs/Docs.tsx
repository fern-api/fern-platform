import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand } from "@fern-ui/react-commons";
import useSize from "@react-hook/size";
import classNames from "classnames";
import { useRef } from "react";
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
    const headerContainerRef = useRef<null | HTMLDivElement>(null);
    const headerContentRef = useRef<null | HTMLDivElement>(null);
    const [headerContainerWidth] = useSize(headerContainerRef);
    const [headerContentWidth] = useSize(headerContentRef);
    const { docsDefinition } = useDocsContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    useCustomTheme(docsDefinition);
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    const { isMobileSidebarOpen } = useMobileSidebarContext();

    const hasSpecifiedBackgroundColor = !!docsDefinition.config.colorsV2?.background;
    const hasSpecifiedBackgroundImage = !!docsDefinition.config.backgroundImage;

    const marginHorizontal = (headerContainerWidth - headerContentWidth) / 2;

    return (
        <div
            className={classNames("relative flex min-h-0 flex-1 bg-background flex-col overflow-x-hidden", {
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
            {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
            <div
                className="border-border-default-light dark:border-border-default-dark sticky inset-x-0 top-0 z-20 border-b"
                ref={headerContainerRef}
            >
                <Header className="max-w-8xl mx-auto" ref={headerContentRef} />
            </div>

            {headerContainerWidth > 0 && headerContentWidth > 0 && (
                <div className="flex min-h-0 w-full flex-1" style={{ marginLeft: marginHorizontal }}>
                    <div className="hidden w-72 md:flex">
                        <Sidebar />
                    </div>
                    {isMobileSidebarOpen && (
                        <div className="bg-background absolute inset-x-0 bottom-0 top-16 z-10 flex md:hidden">
                            <Sidebar hideSearchBar />
                        </div>
                    )}
                    <div className="flex w-full min-w-0 flex-1 flex-col">
                        <DocsMainContent marginHorizontal={marginHorizontal} />
                    </div>
                </div>
            )}
        </div>
    );
};
