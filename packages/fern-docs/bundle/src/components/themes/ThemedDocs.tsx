import dynamic from "next/dynamic";

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
  children,
}: {
  theme: FernTheme;
  children: React.ReactNode;
}) {
  const Docs = THEMES[theme];
  return <Docs>{children}</Docs>;
}
