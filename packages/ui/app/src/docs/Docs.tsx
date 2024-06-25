import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useEffect, useRef } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpointValue } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
import { useNavigationContext } from "../contexts/navigation-context";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import { useCreateSearchService } from "../services/useSearchService";
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
    const { layout, colors, currentVersionId, sidebar } = useDocsContext();
    const openSearchDialog = useOpenSearchDialog();
    const { isInlineFeedbackEnabled } = useFeatureFlags();
    const { resolvedPath } = useNavigationContext();
    const router = useRouter();

    // set up message handler to listen for messages from custom scripts
    useMessageHandler();

    // set up search service
    useCreateSearchService(currentVersionId);

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
    const layoutBreakpoint = useLayoutBreakpointValue();

    const docsMainContent = <DocsMainContent />;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = (_path: string, { shallow }: { shallow: boolean }) => {
            if (ref.current != null && !shallow) {
                ref.current.scrollTo(0, 0);
            }
        };
        router.events.on("routeChangeComplete", handleScroll);

        return () => {
            router.events.off("routeChangeComplete", handleScroll);
        };
    });

    return (
        <PlaygroundContextProvider>
            <div
                id="docs-content"
                className="absolute inset-0 flex h-screen flex-1 flex-col z-0 p-3 overflow-hidden gap-3"
            >
                {(layout?.disableHeader !== true || ["mobile", "sm", "md"].includes(layoutBreakpoint)) && (
                    <HeaderContainer
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                    />
                )}

                <div className="relative mx-auto flex min-h-0 w-full min-w-0 max-w-page-width flex-1 gap-3">
                    {sidebar != null && resolvedPath.type !== "changelog-entry" && (
                        <>
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
                                className={clsx(
                                    "fern-sidebar-container bg-sidebar border-default border rounded-lg hidden w-sidebar-width lg:block",
                                )}
                                logoHeight={logoHeight}
                                logoHref={logoHref}
                                showSearchBar={layout?.disableHeader || layout?.searchbarPlacement !== "HEADER"}
                            />
                            {layout?.disableHeader && <div className="hidden w-sidebar-width lg:block" />}
                        </>
                    )}

                    <main className="fern-main bg-[#FAFAFA] overflow-auto" ref={ref}>
                        {isInlineFeedbackEnabled ? (
                            <FeedbackPopover>{docsMainContent}</FeedbackPopover>
                        ) : (
                            docsMainContent
                        )}
                        {/* <BuiltWithFern className="absolute bottom-0 left-1/2 z-50 my-8 flex w-fit -translate-x-1/2 justify-center" /> */}
                    </main>
                </div>

                {/* Enables footer DOM injection */}
                {/* <footer id="fern-footer" /> */}
            </div>
        </PlaygroundContextProvider>
    );
});
