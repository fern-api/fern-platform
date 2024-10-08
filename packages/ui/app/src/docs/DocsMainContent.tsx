import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Fragment, ReactElement, memo } from "react";
import { useFeatureFlags, useIsReady } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { DocsContent } from "../resolver/DocsContent";

const MdxContent = dynamic(() => import("../mdx/MdxContent").then(({ MdxContent }) => MdxContent), {
    ssr: true,
});

const ApiReferencePage = dynamic(
    () => import("../api-reference/ApiReferencePage").then(({ ApiReferencePage }) => ApiReferencePage),
    { ssr: true },
);

const ApiEndpointPage = dynamic(
    () => import("../api-reference/ApiEndpointPage").then(({ ApiEndpointPage }) => ApiEndpointPage),
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

const DocsMainContentRenderer = memo(({ content }: { content: DocsContent }) => {
    return visitDiscriminatedUnion(content)._visit({
        "custom-markdown-page": (content) => <MdxContent mdx={content.mdx} />,
        "api-reference-page": (content) => <ApiReferencePage content={content} />,
        "api-endpoint-page": (content) => <ApiEndpointPage content={content} />,
        changelog: (content) => <ChangelogPage content={content} />,
        "changelog-entry": (content) => <ChangelogEntryPage content={content} />,
        _other: () => null,
    });
});
DocsMainContentRenderer.displayName = "DocsMainContentRenderer";

function LazyDocsMainContentRenderer({ content }: { content: DocsContent }): ReactElement | null {
    const hydrated = useIsReady();
    return hydrated ? <DocsMainContentRenderer content={content} /> : null;
}

export const DocsMainContent = memo(function DocsMainContent({ content }: { content: DocsContent }): ReactElement {
    const { isInlineFeedbackEnabled } = useFeatureFlags();
    const searchParams = useSearchParams();
    const FeedbackPopoverProvider = isInlineFeedbackEnabled ? FeedbackPopover : Fragment;
    const ContentRenderer =
        searchParams.get("error") === "true" ? LazyDocsMainContentRenderer : DocsMainContentRenderer;

    return (
        <FernErrorBoundary>
            <FeedbackPopoverProvider>
                <ContentRenderer content={content} />
            </FeedbackPopoverProvider>
        </FernErrorBoundary>
    );
});
