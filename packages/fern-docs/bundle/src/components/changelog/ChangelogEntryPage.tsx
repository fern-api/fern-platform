import "server-only";

import React, { ReactElement } from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { Badge } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { HideBuiltWithFern } from "@/components/built-with-fern";
import { SetLayout } from "@/state/layout";

import { FernLink } from "../components/FernLink";
import { Separator } from "../components/Separator";
import { FooterLayout } from "../layouts/FooterLayout";
import { ChangelogContentLayout } from "./ChangelogContentLayout";

export default function ChangelogEntryPage({
  node,
  overview,
  bottomNavigation,
  children,
}: {
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
      <FooterLayout
        className="max-w-content-width mx-auto"
        bottomNavigation={bottomNavigation}
      />
    </article>
  );
}
