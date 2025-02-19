import { FernScrollArea, cn } from "@fern-docs/components";
import type { TableOfContentsItem } from "@fern-docs/mdx";

import { TableOfContents } from "../components/table-of-contents/TableOfContents";

interface TableOfContentsLayoutProps {
  tableOfContents: TableOfContentsItem[] | undefined;
  hideTableOfContents?: boolean;
}

export function TableOfContentsLayout({
  tableOfContents,
  hideTableOfContents,
}: TableOfContentsLayoutProps) {
  return (
    tableOfContents != null &&
    !hideTableOfContents &&
    tableOfContents.length > 0 && (
      <aside
        role="directory"
        className={cn(
          "top-header-height sticky order-last hidden h-fit max-h-[calc(100dvh-var(--spacing-header-height))] flex-col xl:flex",
          "w-sidebar-width"
        )}
      >
        <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-5">
          <TableOfContents tableOfContents={tableOfContents} />
        </FernScrollArea>
      </aside>
    )
  );
}
