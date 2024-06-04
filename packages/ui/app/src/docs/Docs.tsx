import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpoint } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
import { useNavigationContext } from "../contexts/navigation-context/useNavigationContext";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import { useCreateSearchService } from "../services/useSearchService";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { useIsMobileSidebarOpen, useMessageHandler, useOpenSearchDialog } from "../sidebar/atom";
import { DocsMainContent } from "./DocsMainContent";
import { HeaderContainer } from "./HeaderContainer";

const Sidebar = dynamic(() => import("../sidebar/Sidebar").then(({ Sidebar }) => Sidebar), { ssr: true });

interface DocsProps {
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
}

export const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({ logoHeight, logoHref }) {
    const { layout, colors, currentVersionIndex } = useDocsContext();
    const { registerScrolledToPathListener, selectedSlug } = useNavigationContext();
    const openSearchDialog = useOpenSearchDialog();
    const { isInlineFeedbackEnabled } = useFeatureFlags();

    // set up message handler to listen for messages from custom scripts
    useMessageHandler();

    // set up search service
    useCreateSearchService(currentVersionIndex);

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

    const isMobileSidebarOpen = useIsMobileSidebarOpen();

    const currentSlug = useMemo(() => selectedSlug?.split("/") ?? [], [selectedSlug]);
    const layoutBreakpoint = useLayoutBreakpoint();

    const docsMainContent = <DocsMainContent />;

    return (
        <PlaygroundContextProvider>
            <div id="docs-content" className="relative flex min-h-screen flex-1 flex-col z-0">
                {(layout?.disableHeader !== true || ["mobile", "sm", "md"].includes(layoutBreakpoint)) && (
                    <HeaderContainer
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                    />
                )}

                <div className="relative mx-auto flex min-h-0 w-full min-w-0 max-w-page-width flex-1">
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
                                ? "fern-sidebar-container bg-sidebar border-concealed sticky top-header-height mt-header-height hidden h-vh-minus-header w-sidebar-width lg:block"
                                : "fern-sidebar-container bg-sidebar border-concealed fixed hidden h-vh-minus-header w-sidebar-width lg:block"
                        }
                        currentSlug={currentSlug}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                        showSearchBar={layout?.disableHeader || layout?.searchbarPlacement !== "HEADER"}
                    />
                    {layout?.disableHeader && <div className="hidden w-sidebar-width lg:block" />}

                    <main className="fern-main">
                        {isInlineFeedbackEnabled ? (
                            <FeedbackPopover>{docsMainContent}</FeedbackPopover>
                        ) : (
                            docsMainContent
                        )}
                    </main>
                    <BuiltWithFern className="absolute bottom-0 left-1/2 z-50 my-8 flex w-fit -translate-x-1/2 justify-center" />
                </div>

                {/* Enables footer DOM injection */}
                <footer id="fern-footer" />
            </div>
        </PlaygroundContextProvider>
    );
});
