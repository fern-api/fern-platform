"use client";

import { ReactNode } from "react";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { DocsContent } from "../resolver/DocsContent";

export default function MarkdownPage({
  content,
}: {
  content: DocsContent.MarkdownPage;
}): ReactNode {
  return <LayoutEvaluator {...content} />;
}
