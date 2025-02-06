"use server";

import { Fragment, ReactElement } from "react";
import { UnreachableCaseError } from "ts-essentials";
import ApiEndpointPage from "../api-reference/ApiEndpointPage";
import ApiReferencePage from "../api-reference/ApiReferencePage";
import ChangelogEntryPage from "../changelog/ChangelogEntryPage";
import ChangelogPage from "../changelog/ChangelogPage";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import FeedbackPopover from "../feedback/FeedbackPopover";
import type { DocsContent } from "../resolver/DocsContent";
import MarkdownPage from "./MarkdownPage";

const DocsMainContentRenderer = function DocsMainContentRenderer({
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
};

export async function DocsMainContent({
  content,
  isInlineFeedbackEnabled = false,
}: {
  content: DocsContent;
  isInlineFeedbackEnabled?: boolean;
}) {
  const FeedbackPopoverProvider = isInlineFeedbackEnabled
    ? FeedbackPopover
    : Fragment;

  return (
    <FernErrorBoundary>
      <FeedbackPopoverProvider>
        <DocsMainContentRenderer content={content} />
      </FeedbackPopoverProvider>
    </FernErrorBoundary>
  );
}
