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
  isSidebarFixed = false,
  isHeaderDisabled = false,
  showSearchBarInTabs = false,
  lightSidebarClassName,
  darkSidebarClassName,
  lightHeaderClassName,
  darkHeaderClassName,
}: {
  theme?: FernTheme;
  announcement?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  tabs?: React.ReactNode;
  isSidebarFixed?: boolean;
  isHeaderDisabled?: boolean;
  showSearchBarInTabs?: boolean;
  lightSidebarClassName?: string;
  darkSidebarClassName?: string;
  lightHeaderClassName?: string;
  darkHeaderClassName?: string;
}) {
  const Docs = THEMES[theme];
  return (
    <Docs
      announcement={announcement}
      header={header}
      sidebar={sidebar}
      tabs={tabs}
      isSidebarFixed={isSidebarFixed}
      isHeaderDisabled={isHeaderDisabled}
      showSearchBarInTabs={showSearchBarInTabs}
      lightSidebarClassName={lightSidebarClassName}
      darkSidebarClassName={darkSidebarClassName}
      lightHeaderClassName={lightHeaderClassName}
      darkHeaderClassName={darkHeaderClassName}
    >
      {children}
    </Docs>
  );
}
