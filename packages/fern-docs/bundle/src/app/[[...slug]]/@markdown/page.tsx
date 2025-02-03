"use server";

import {
  MdxBundlerComponent,
  serializeMdx,
} from "@/client/mdx/bundlers/mdx-bundler";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFileResolver } from "@/server/file-resolver";
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
  const [
    { node, currentVersion, currentTab, authState },
    files,
    mdxBundlerFiles,
  ] = await Promise.all([
    findNode(slug),
    docsLoader.getFiles(),
    docsLoader.getMdxBundlerFiles(),
  ]);

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

  const resolveFileSrc = createFileResolver(files);

  const mdx = await serializeMdx(page.markdown, {
    filename: pageId,
    files: mdxBundlerFiles,
    scope: {
      props: {
        authed: authState.authed,
        user: authState.authed ? authState.user : undefined,
        version: currentVersion?.versionId,
        tab: currentTab?.title,
      },
    },
    replaceSrc: resolveFileSrc,
  });

  if (typeof mdx === "string") {
    return <div>{mdx}</div>;
  }

  return <MdxBundlerComponent {...mdx} />;
}
