import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { Roboto, Roboto_Mono } from "next/font/google";
import { memo } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpoint } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
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

const roboto = Roboto({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    preload: true,
    variable: "--typography-body-font-family",
});
const robotoMono = Roboto_Mono({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    preload: true,
    variable: "--typography-code-font-family",
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs({ logoHeight, logoHref }) {
    const { layout, currentVersionId } = useDocsContext();
    const openSearchDialog = useOpenSearchDialog();
    const { isInlineFeedbackEnabled } = useFeatureFlags();

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
    const layoutBreakpoint = useLayoutBreakpoint();

    const docsMainContent = <DocsMainContent />;

    return (
        <PlaygroundContextProvider>
            <div
                id="docs-content"
                className={clsx("relative flex min-h-screen flex-1 flex-col z-0", roboto.variable, robotoMono.variable)}
            >
                {(layout?.disableHeader !== true || ["mobile", "sm", "md"].includes(layoutBreakpoint)) && (
                    <HeaderContainer
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                    />
                )}

                <div className="relative mx-auto flex min-h-0 w-full min-w-0 max-w-page-width flex-1">
                    <Sidebar
                        className={
                            "top-header-height fern-sidebar-container border-concealed fixed hidden h-vh-minus-header w-sidebar-width lg:block bg-white shadow-google"
                        }
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                        showSearchBar={layout?.disableHeader || layout?.searchbarPlacement !== "HEADER"}
                    />
                    {layout?.disableHeader && <div className="hidden w-sidebar-width lg:block" />}

                    <main className="fern-main ml-sidebar-width">
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
