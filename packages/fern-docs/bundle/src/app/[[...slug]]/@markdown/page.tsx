"use server";

import { createCachedFindNode } from "@/app/find-node";
import {
  MdxBundlerComponent,
  serializeMdx,
} from "@/client/mdx/bundlers/mdx-bundler";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { withServerProps } from "@/server/withServerProps";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { getPageId } from "@fern-api/fdr-sdk/navigation";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = FernNavigation.slugjoin(params.slug);
  const { domain, host, fern_token } = await withServerProps();
  const findNode = createCachedFindNode(domain, host);
  const docs = createCachedDocsLoader(domain, host);
  const { node, currentVersion, currentTab, authState } = await findNode(
    slug,
    fern_token
  );

  const pageId = getPageId(node);
  if (!pageId) {
    return notFound();
  }

  const page = await docs.getPage(pageId);
  if (!page) {
    return notFound();
  }

  const resolveFileSrc = createFileResolver(await docs.getFiles());

  const mdx = await serializeMdx(page.markdown, {
    filename: pageId,
    files: await docs.getMdxBundlerFiles(),
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
