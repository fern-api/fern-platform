"use server";

import Mdx from "@/components/mdx";
import { AuthState } from "@/server/auth/getAuthState";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { getPageId } from "@fern-api/fdr-sdk/navigation";
import { notFound } from "next/navigation";

export default async function Article({
  node,
  authState,
  currentVersionId,
  currentTabTitle,
}: {
  node: FernNavigation.NavigationNodePage;
  authState: AuthState;
  currentVersionId: string | undefined;
  currentTabTitle: string | undefined;
}) {
  const docsLoader = await createCachedDocsLoader();
  const pageId = getPageId(node);
  if (!pageId) {
    return notFound();
  }

  const page = await docsLoader.getPage(pageId);
  if (!page) {
    return notFound();
  }

  return (
    <article className="prose dark:prose-invert">
      <Mdx
        filename={pageId}
        scope={{
          props: {
            authed: authState.authed,
            user: authState.authed ? authState.user : undefined,
            version: currentVersionId,
            tab: currentTabTitle,
          },
        }}
        dangerouslyForceHydrate
      >
        {page.markdown}
      </Mdx>
    </article>
  );
}
