import dynamic from "next/dynamic";

const THEMES = {
  default: dynamic(() => import("./default/DefaultDocs"), { ssr: true }),
  cohere: dynamic(() => import("./cohere/CohereDocs"), { ssr: true }),
};

export type FernTheme = keyof typeof THEMES;

export function ThemedDocs({
  theme = "default",
  announcement,
  header,
  sidebar,
  children,
  tabs,
  sidebarFixed = false,
}: {
  theme?: FernTheme;
  announcement?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  tabs?: React.ReactNode;
  sidebarFixed?: boolean;
}) {
  const Docs = THEMES[theme];
  return (
    <Docs
      announcement={announcement}
      header={header}
      sidebar={sidebar}
      tabs={tabs}
      sidebarFixed={sidebarFixed}
    >
      {children}
    </Docs>
  );
}
