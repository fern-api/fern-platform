import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Fragment, ReactElement, memo } from "react";
import { useFeatureFlags, useIsReady, useResolvedPath } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";

const MdxContent = dynamic(() => import("../mdx/MdxContent").then(({ MdxContent }) => MdxContent), {
    ssr: true,
});

const ApiReferencePage = dynamic(
    () => import("../api-reference/ApiReferencePage").then(({ ApiReferencePage }) => ApiReferencePage),
    { ssr: true },
);

const ApiDefinitionPage = dynamic(
    () => import("../api-reference/ApiDefinitionPage").then(({ ApiDefinitionPage }) => ApiDefinitionPage),
    { ssr: true },
);

const ChangelogPage = dynamic(() => import("../changelog/ChangelogPage").then(({ ChangelogPage }) => ChangelogPage), {
    ssr: true,
});

const ChangelogEntryPage = dynamic(
    () => import("../changelog/ChangelogEntryPage").then(({ ChangelogEntryPage }) => ChangelogEntryPage),
    { ssr: true },
);

const FeedbackPopover = dynamic(
    () => import("../feedback/FeedbackPopover").then(({ FeedbackPopover }) => FeedbackPopover),
    { ssr: false },
);

const DocsMainContentRenderer = memo(() => {
    const resolvedPath = useResolvedPath();
    return visitDiscriminatedUnion(resolvedPath)._visit({
        "custom-markdown-page": (resolvedPath) => <MdxContent mdx={resolvedPath.mdx} />,
        "api-reference-page": (resolvedPath) => (
            <ApiReferencePage initialApi={resolvedPath.apiDefinition} showErrors={resolvedPath.showErrors} />
        ),
        "api-definition-page": (resolvedPath) => (
            <ApiDefinitionPage
                item={resolvedPath.item}
                showErrors={resolvedPath.showErrors}
                types={resolvedPath.types}
            />
        ),
        changelog: (resolvedPath) => <ChangelogPage resolvedPath={resolvedPath} />,
        "changelog-entry": (resolvedPath) => <ChangelogEntryPage resolvedPath={resolvedPath} />,
        _other: () => null,
    });
});
DocsMainContentRenderer.displayName = "DocsMainContentRenderer";

function LazyDocsMainContentRenderer(): ReactElement | null {
    const hydrated = useIsReady();
    return hydrated ? <DocsMainContentRenderer /> : null;
}

export const DocsMainContent = memo(function DocsMainContent(): ReactElement {
    const { isInlineFeedbackEnabled } = useFeatureFlags();
    const searchParams = useSearchParams();
    const FeedbackPopoverProvider = isInlineFeedbackEnabled ? FeedbackPopover : Fragment;
    const ContentRenderer =
        searchParams.get("error") === "true" ? LazyDocsMainContentRenderer : DocsMainContentRenderer;

    return (
        <FernErrorBoundary>
            <FeedbackPopoverProvider>
                <ContentRenderer />
            </FeedbackPopoverProvider>
        </FernErrorBoundary>
    );
});
