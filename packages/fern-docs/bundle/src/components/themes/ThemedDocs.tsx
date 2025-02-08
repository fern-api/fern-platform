import { CohereDocs } from "./cohere/CohereDocs";
import { DefaultDocs } from "./default/DefaultDocs";

const THEMES = {
  default: DefaultDocs,
  cohere: CohereDocs,
};

export type FernTheme = keyof typeof THEMES;

export async function ThemedDocs({
  theme = "default",
  children,
}: {
  theme: FernTheme | undefined;
  children: React.ReactNode;
}) {
  const Docs = THEMES[theme];
  return <Docs>{children}</Docs>;
}
