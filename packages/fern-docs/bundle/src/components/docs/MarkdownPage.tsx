"use client";

import { ReactNode } from "react";
import { useWriteApiDefinitionsAtom } from "../atoms";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { DocsContent } from "../resolver/DocsContent";

export default function MarkdownPage({
  content,
}: {
  content: DocsContent.MarkdownPage;
}): ReactNode {
  useWriteApiDefinitionsAtom(content.apis);
  return <LayoutEvaluator {...content} />;
}
