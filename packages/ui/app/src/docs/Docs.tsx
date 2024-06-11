import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PLATFORM } from "@fern-ui/core-utils";
import { useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";
import dynamic from "next/dynamic";
import { memo } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import { useCreateSearchService } from "../services/useSearchService";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { useMessageHandler, useOpenSearchDialog } from "../sidebar/atom";
import { DocsMainContent } from "./DocsMainContent";

interface DocsProps {
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
}

export const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export const Docs: React.FC<DocsProps> = memo<DocsProps>(function UnmemoizedDocs() {
    const { currentVersionId } = useDocsContext();
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

    const docsMainContent = <DocsMainContent />;

    return (
        <PlaygroundContextProvider>
            <main className="fern-main">
                {isInlineFeedbackEnabled ? <FeedbackPopover>{docsMainContent}</FeedbackPopover> : docsMainContent}
            </main>
            <BuiltWithFern className="absolute bottom-0 left-1/2 z-50 my-8 flex w-fit -translate-x-1/2 justify-center" />
        </PlaygroundContextProvider>
    );
});
