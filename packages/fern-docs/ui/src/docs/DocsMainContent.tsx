import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Fragment, ReactElement, memo } from "react";
import { UnreachableCaseError } from "ts-essentials";
import { useFeatureFlag, useIsReady } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import type { DocsContent } from "../resolver/DocsContent";

const MarkdownPage = dynamic(() => import("./MarkdownPage"), { ssr: true });

const ApiReferencePage = dynamic(
  () => import("../api-reference/ApiReferencePage"),
  { ssr: true }
);

const ApiEndpointPage = dynamic(
  () => import("../api-reference/ApiEndpointPage"),
  { ssr: true }
);

const ChangelogPage = dynamic(() => import("../changelog/ChangelogPage"), {
  ssr: true,
});

const ChangelogEntryPage = dynamic(
  () => import("../changelog/ChangelogEntryPage"),
  { ssr: true }
);

const FeedbackPopover = dynamic(() => import("../feedback/FeedbackPopover"), {
  ssr: true,
});

const DocsMainContentRenderer = memo(function DocsMainContentRenderer({
  content,
}: {
  content: DocsContent;
}): ReactElement | null {
  switch (content.type) {
    case "markdown-page":
      return <MarkdownPage content={content} />;
    case "api-reference-page":
      return <ApiReferencePage content={content} />;
    case "api-endpoint-page":
      return <ApiEndpointPage content={content} />;
    case "changelog":
      return <ChangelogPage content={content} />;
    case "changelog-entry":
      return <ChangelogEntryPage content={content} />;
    default:
      console.error(new UnreachableCaseError(content));
      return null;
  }
});

function LazyDocsMainContentRenderer({
  content,
}: {
  content: DocsContent;
}): ReactElement | null {
  const hydrated = useIsReady();
  return hydrated ? <DocsMainContentRenderer content={content} /> : null;
}

export const DocsMainContent = memo(function DocsMainContent({
  content,
}: {
  content: DocsContent;
}): ReactElement {
  const isInlineFeedbackEnabled = useFeatureFlag("isInlineFeedbackEnabled");
  const searchParams = useSearchParams();

  const FeedbackPopoverProvider = isInlineFeedbackEnabled
    ? FeedbackPopover
    : Fragment;

  const ContentRenderer =
    searchParams.get("error") === "true"
      ? LazyDocsMainContentRenderer
      : DocsMainContentRenderer;

  return (
    <FernErrorBoundary>
      <FeedbackPopoverProvider>
        <ContentRenderer content={content} />
      </FeedbackPopoverProvider>
    </FernErrorBoundary>
  );
});
