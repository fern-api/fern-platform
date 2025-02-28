import "server-only";

import React, { ReactElement } from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { Badge } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { HideBuiltWithFern } from "@/components/built-with-fern";
import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";
import { SetLayout } from "@/state/layout";

import { FernLink } from "../components/FernLink";
import { Separator } from "../components/Separator";
import { FooterLayout } from "../layouts/FooterLayout";
import { ChangelogContentLayout } from "./ChangelogContentLayout";

export default function ChangelogEntryPage({
  loader,
  serialize,
  node,
  overview,
  bottomNavigation,
  children,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  node: FernNavigation.ChangelogEntryNode;
  overview: React.ReactNode;
  bottomNavigation: React.ReactNode;
  children: React.ReactNode;
}): ReactElement<any> {
  return (
    <article className="max-w-page-width-padded px-page-padding mx-auto min-w-0 flex-1">
      <SetLayout value="page" />
      <HideBuiltWithFern>
        <ChangelogContentLayout as="section" className="pb-8">
          {overview}
        </ChangelogContentLayout>
        <Separator className="max-w-content-width mx-auto my-12" />
        <ChangelogContentLayout
          as="article"
          id={node.date}
          stickyContent={
            <Badge asChild>
              <FernLink href={addLeadingSlash(node.slug)}>
                {node.title}
              </FernLink>
            </Badge>
          }
        >
          {children}
        </ChangelogContentLayout>
      </HideBuiltWithFern>
      <FooterLayoutWithEditThisPageUrl
        pageId={node.pageId}
        loader={loader}
        serialize={serialize}
        bottomNavigation={bottomNavigation}
      />
    </article>
  );
}

async function FooterLayoutWithEditThisPageUrl({
  pageId,
  loader,
  serialize,
  bottomNavigation,
}: {
  pageId: string;
  loader: DocsLoader;
  serialize: MdxSerializer;
  bottomNavigation: React.ReactNode;
}) {
  // all this does is get the edit this page url from the mdx frontmatter, but hopefully the mdx was already serialized and cached
  const page = await loader.getPage(pageId);
  const mdx = await serialize(page.markdown, {
    filename: pageId,
  });
  const editThisPageUrl =
    mdx?.frontmatter?.["edit-this-page-url"] ?? page.editThisPageUrl;
  return (
    <FooterLayout
      bottomNavigation={bottomNavigation}
      editThisPageUrl={editThisPageUrl}
    />
  );
}
