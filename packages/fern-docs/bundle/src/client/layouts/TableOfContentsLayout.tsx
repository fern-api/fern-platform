"use client";

import { FernScrollArea } from "@fern-docs/components";
import type { TableOfContentsItem } from "@fern-docs/mdx";
import { ReactElement } from "react";
import { TableOfContents } from "../components/table-of-contents/TableOfContents";

export default function TableOfContentsLayout({
  tableOfContents,
  hideTableOfContents,
  sidebarWidth,
  pageWidth,
}: {
  tableOfContents: TableOfContentsItem[] | undefined;
  hideTableOfContents?: boolean;
  sidebarWidth: number;
  pageWidth: number | undefined;
}): ReactElement {
  return (
    <aside
      className="sticky shrink-0"
      style={{
        top: `var(--header-height)`,
        height: `calc(100dvh - var(--header-height))`,
        maxHeight: "fit-content",
        width: pageWidth
          ? `calc(${sidebarWidth}px + max(calc((100dvw - ${pageWidth}px) / 2), 0px))`
          : sidebarWidth,
        paddingRight: pageWidth
          ? `max(calc((100dvw - ${pageWidth}px) / 2), 0px)`
          : 0,
        zIndex: 20,
      }}
    >
      {tableOfContents != null &&
        !hideTableOfContents &&
        tableOfContents.length > 0 && (
          <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8">
            <TableOfContents tableOfContents={tableOfContents} />
          </FernScrollArea>
        )}
    </aside>
  );
}
