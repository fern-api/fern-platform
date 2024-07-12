import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Fragment, ReactElement, memo } from "react";
import { useFeatureFlags } from "../atoms/flags";
import { useResolvedPath } from "../atoms/navigation";
import { useIsReady } from "../atoms/viewport";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import { ChangelogEntryPage } from "./ChangelogEntryPage";

const CustomDocsPage = dynamic(
    () => import("../custom-docs-page/CustomDocsPage").then(({ CustomDocsPage }) => CustomDocsPage),
    { ssr: true },
);

const ApiPage = dynamic(() => import("../api-page/ApiPage").then(({ ApiPage }) => ApiPage), {
    ssr: true,
});

const ChangelogPage = dynamic(() => import("./ChangelogPage").then(({ ChangelogPage }) => ChangelogPage), {
    ssr: true,
});

export interface DocsMainContentProps {}

function DocsMainContentInternal(): ReactElement | null {
    const resolvedPath = useResolvedPath();
    const hydrated = useIsReady();

    const router = useRouter();
    if (router.query.lazy === "true") {
        if (!hydrated) {
            return null;
        }
    }

    return visitDiscriminatedUnion(resolvedPath)._visit({
        "custom-markdown-page": (resolvedPath) => <CustomDocsPage mdx={resolvedPath.mdx} resolvedPath={resolvedPath} />,
        "api-page": (resolvedPath) => (
            <ApiPage initialApi={resolvedPath.apiDefinition} showErrors={resolvedPath.showErrors} />
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
