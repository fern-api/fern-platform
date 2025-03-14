import "server-only";

import React, { ReactElement } from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { Badge } from "@fern-docs/components";
import { slugToHref } from "@fern-docs/utils";

import { FernLink } from "@/components/FernLink";
import { Separator } from "@/components/Separator";
import { HideBuiltWithFern } from "@/components/built-with-fern";
import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";
import { HideAsides, SetLayout } from "@/state/layout";

import { AsideAwareDiv } from "../layouts/AsideAwareDiv";
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
    <AsideAwareDiv className="fern-layout-aside-container mr-auto">
      <SetLayout value="page" />
      <HideAsides force />
      <article className="fern-layout-page">
        <HideBuiltWithFern>
          <ChangelogContentLayout as="section" className="mb-8">
            {overview}
          </ChangelogContentLayout>
          <Separator className="max-w-content-width mx-auto my-12" />
          <ChangelogContentLayout
            as="article"
            id={node.date}
            stickyContent={
              <Badge asChild>
                <FernLink href={slugToHref(node.slug)} scroll={true}>
                  {node.title}
                </FernLink>
              </Badge>
            }
          >
            {children}
          </ChangelogContentLayout>
        </HideBuiltWithFern>
        <FooterLayoutWithEditThisPageUrl
          slug={node.slug}
          pageId={node.pageId}
          loader={loader}
          serialize={serialize}
          bottomNavigation={bottomNavigation}
        />
      </article>
    </AsideAwareDiv>
  );
}

async function FooterLayoutWithEditThisPageUrl({
  pageId,
  loader,
  serialize,
  slug,
  bottomNavigation,
}: {
  pageId: string;
  loader: DocsLoader;
  serialize: MdxSerializer;
  slug: string;
  bottomNavigation: React.ReactNode;
}) {
  // all this does is get the edit this page url from the mdx frontmatter, but hopefully the mdx was already serialized and cached
  const page = await loader.getPage(pageId);
  const mdx = await serialize(page.markdown, {
    filename: page.filename,
    slug,
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
