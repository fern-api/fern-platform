import CohereDocs from "./cohere/CohereDocs";
import DefaultDocs from "./default/DefaultDocs";

const THEMES = {
  default: DefaultDocs,
  cohere: CohereDocs,
};

export type FernTheme = keyof typeof THEMES;

export async function ThemedDocs({
  theme = "default",
  announcement,
  children,
}: {
  theme?: FernTheme;
  announcement?: React.ReactNode;
  children: React.ReactNode;
}) {
  const Docs = THEMES[theme];
  return <Docs announcement={announcement}>{children}</Docs>;
}
