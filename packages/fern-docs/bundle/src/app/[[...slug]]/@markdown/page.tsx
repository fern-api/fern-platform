"use server";

import Mdx from "@/components/mdx";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFindNode } from "@/server/find-node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { getPageId } from "@fern-api/fdr-sdk/navigation";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = FernNavigation.slugjoin(params.slug);
  const docsLoader = await createCachedDocsLoader();
  const findNode = createFindNode(docsLoader);
  const { node, currentVersion, currentTab, authState } = await findNode(slug);

  const pageId = getPageId(node);
  if (!pageId) {
    console.warn("pageId not found", slug);
    return notFound();
  }

  const page = await docsLoader.getPage(pageId);
  if (!page) {
    console.warn("page not found", pageId);
    return notFound();
  }

  return (
    <Mdx
      filename={pageId}
      scope={{
        props: {
          authed: authState.authed,
          user: authState.authed ? authState.user : undefined,
          version: currentVersion?.versionId,
          tab: currentTab?.title,
        },
      }}
    >
      {page.markdown}
    </Mdx>
  );
}
