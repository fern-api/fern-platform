import { ReactElement } from "react";
import { useWriteApiDefinitionsAtom } from "../atoms";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { DocsContent } from "../resolver/DocsContent";

interface MarkdownPageProps {
  content: DocsContent.MarkdownPage;
}

export function MarkdownPage({ content }: MarkdownPageProps): ReactElement {
  useWriteApiDefinitionsAtom(content.apis);
  return <LayoutEvaluator {...content} />;
}
