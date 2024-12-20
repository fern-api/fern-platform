import type { TableOfContentsItem } from "@fern-docs/mdx";
import { FernScrollArea } from "@fern-docs/components";
import { ReactElement } from "react";
import { TableOfContents } from "../components/table-of-contents/TableOfContents";

interface TableOfContentsLayoutProps {
  tableOfContents: TableOfContentsItem[] | undefined;
}

export function TableOfContentsLayout({
  tableOfContents,
}: TableOfContentsLayoutProps): ReactElement {
  return (
    <aside className="fern-layout-toc">
      {tableOfContents != null && tableOfContents.length > 0 && (
        <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8">
          <TableOfContents tableOfContents={tableOfContents} />
        </FernScrollArea>
      )}
    </aside>
  );
}
