"use server";

import TableOfContentsLayout from "@/client/layouts/TableOfContentsLayout";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { getFrontmatter, makeToc, toTree } from "@fern-docs/mdx";

export default async function TableOfContentsServer({
  pageId,
  hideTableOfContents,
  sidebarWidth,
  pageWidth,
}: {
  pageId: string | undefined;
  hideTableOfContents?: boolean;
  sidebarWidth: number;
  pageWidth: number | undefined;
}) {
  if (!pageId) {
    return false;
  }
  const docsLoader = await createCachedDocsLoader();
  const page = await docsLoader.getPage(pageId);
  if (!page) {
    return false;
  }
  const { data: frontmatter, content } = getFrontmatter(page.markdown);
  const { hast } = toTree(content);
  const tableOfContents = makeToc(hast, frontmatter?.["force-toc"]);
  return (
    <TableOfContentsLayout
      tableOfContents={tableOfContents}
      hideTableOfContents={hideTableOfContents}
      sidebarWidth={sidebarWidth}
      pageWidth={pageWidth}
    />
  );
}
