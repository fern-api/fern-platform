"use client";

export function GlobalStyles({
  children,
  domain,
  layout,
}: {
  children: string;
  domain: string;
  layout: {
    logoHeight: number;
    sidebarWidth: number;
    headerHeight: number;
    pageWidth: number | undefined;
    contentWidth: number;
    tabsPlacement: "SIDEBAR" | "HEADER";
    searchbarPlacement: "SIDEBAR" | "HEADER" | "HEADER_TABS";
  };
}) {
  return (
    <style jsx global>
      {`
        :root {
          ${domain.includes("nominal") ? "--radius: 0px;" : ""}
          ${domain.includes("nominal") ? "--border-color: #000;" : ""}
          ${layout.headerHeight
            ? `--header-height-real: ${layout.headerHeight}px;`
            : ""}
        }

        :is(.dark) {
          ${domain.includes("nominal") ? "--border-color: #fff;" : ""}
        }

        ${children}
      `}
    </style>
  );
}
