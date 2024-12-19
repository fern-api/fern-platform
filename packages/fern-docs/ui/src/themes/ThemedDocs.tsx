import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { DocsContent } from "../resolver/DocsContent";

const THEMES = {
  default: dynamic(
    () =>
      import("./default/DefaultDocs").then(({ DefaultDocs }) => DefaultDocs),
    { ssr: true }
  ),
  cohere: dynamic(
    () => import("./cohere/CohereDocs").then(({ CohereDocs }) => CohereDocs),
    { ssr: true }
  ),
};

export type FernTheme = keyof typeof THEMES;

export function ThemedDocs({
  theme,
  content,
}: {
  theme: FernTheme;
  content: DocsContent;
}): ReactElement {
  const Docs = THEMES[theme];
  return <Docs content={content} />;
}
