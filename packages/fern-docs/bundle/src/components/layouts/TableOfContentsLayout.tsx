import { FernScrollArea } from "@fern-docs/components";
import type { TableOfContentsItem } from "@fern-docs/mdx";

import { SetEmptyTableOfContents } from "@/state/layout";

import { FERN_TOC_ID } from "../constants";
import { TableOfContents } from "../table-of-contents/TableOfContents";

interface TableOfContentsLayoutProps {
  tableOfContents: TableOfContentsItem[] | undefined;
  hideTableOfContents?: boolean;
}

export function TableOfContentsLayout({
  tableOfContents,
  hideTableOfContents,
}: TableOfContentsLayoutProps) {
  const showTableOfContents =
    tableOfContents != null &&
    !hideTableOfContents &&
    tableOfContents.length > 0;
  return (
    <aside id={FERN_TOC_ID}>
      <SetEmptyTableOfContents value={!showTableOfContents} />
      {showTableOfContents && (
        <FernScrollArea className="not-prose">
          <TableOfContents tableOfContents={tableOfContents} />
        </FernScrollArea>
      )}
    </aside>
  );
}
