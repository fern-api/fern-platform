import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Fragment, ReactElement, memo } from "react";
import { useFeatureFlags, useIsReady, useResolvedPath } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FeedbackPopover } from "../feedback/FeedbackPopover";
import { MdxContent } from "../mdx/MdxContent";
import { ChangelogEntryPage } from "../changelog/ChangelogEntryPage";

const ApiPage = dynamic(() => import("../api-page/ApiPage").then(({ ApiPage }) => ApiPage), {
    ssr: true,
});

const ChangelogPage = dynamic(() => import("../changelog/ChangelogPage").then(({ ChangelogPage }) => ChangelogPage), {
    ssr: true,
});

export interface DocsMainContentProps {}

function DocsMainContentInternal(): ReactElement | null {
    const resolvedPath = useResolvedPath();
    const hydrated = useIsReady();

    const router = useRouter();
    if (router.query.error === "true") {
        if (!hydrated) {
            return null;
        }
    }

    return visitDiscriminatedUnion(resolvedPath)._visit({
        "custom-markdown-page": (resolvedPath) => <MdxContent mdx={resolvedPath.mdx} />,
        "api-page": (resolvedPath) => (
            <ApiPage
                initialApi={resolvedPath.apiDefinition}
                showErrors={resolvedPath.showErrors}
                paginated={resolvedPath.paginated}
            />
        ),
        changelog: (resolvedPath) => <ChangelogPage resolvedPath={resolvedPath} />,
        "changelog-entry": (resolvedPath) => <ChangelogEntryPage resolvedPath={resolvedPath} />,
        _other: () => null,
    });
}

export const DocsMainContent = memo(function DocsMainContent(): ReactElement {
    const { isInlineFeedbackEnabled } = useFeatureFlags();
    const FeedbackPopoverProvider = isInlineFeedbackEnabled ? FeedbackPopover : Fragment;
    return (
        <FernErrorBoundary>
            <FeedbackPopoverProvider>
                <DocsMainContentInternal />
            </FeedbackPopoverProvider>
        </FernErrorBoundary>
    );
});
