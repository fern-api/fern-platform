import { ColorsThemeConfig } from "@/server/types";

const THEMES = {
  default: import("./default/DefaultDocs").then((mod) => mod.default),
  cohere: import("./cohere/CohereDocs").then((mod) => mod.default),
};

export type FernTheme = keyof typeof THEMES;

export async function ThemedDocs({
  theme = "default",
  colors,
  announcement,
  header,
  sidebar,
  children,
  headerHeight,
}: {
  theme?: FernTheme;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
  announcement?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  headerHeight?: number;
}) {
  const Docs = await THEMES[theme];
  return (
    <Docs
      announcement={announcement}
      colors={colors}
      header={header}
      sidebar={sidebar}
      headerHeight={headerHeight}
    >
      {children}
    </Docs>
  );
}
