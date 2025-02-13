import { FernScrollArea } from "@fern-docs/components";
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
    <aside className="w-sidebar-width sticky top-[var(--header-height)] flex h-fit max-h-[calc(100dvh-var(--header-height))] flex-col pl-1">
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
