"use client";

import React, { Fragment, ReactElement, useEffect, useMemo } from "react";

import { chunk } from "es-toolkit/array";
import { useAtomValue } from "jotai";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { Badge } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

import { FernLink } from "@/components/FernLink";
import { Separator } from "@/components/Separator";
import { HideBuiltWithFern } from "@/components/built-with-fern";
import { useCurrentAnchor } from "@/hooks/use-anchor";
import { HideAsides, SetLayout } from "@/state/layout";
import { SCROLL_BODY_ATOM } from "@/state/viewport";

import { BottomNavigationClient } from "../bottom-nav-client";
import { FooterLayout } from "../layouts/FooterLayout";
import { ChangelogContentLayout } from "./ChangelogContentLayout";

function flattenChangelogEntries(
  node: FernNavigation.ChangelogNode
): FernNavigation.ChangelogEntryNode[] {
  return node.children.flatMap((year) =>
    year.children.flatMap((month) => month.children)
  );
}

const CHANGELOG_PAGE_SIZE = 10;

export default function ChangelogPageClient({
  node,
  anchorIds,
  overview,
  entries,
}: {
  node: FernNavigation.ChangelogNode;
  anchorIds: Record<string, FernNavigation.PageId>;
  overview: React.ReactNode;
  entries: Record<string, React.ReactNode>;
}): ReactElement<any> {
  const flattenedEntries = useMemo(() => flattenChangelogEntries(node), [node]);
  const chunkedEntries = useMemo(
    () => chunk(flattenedEntries, CHANGELOG_PAGE_SIZE),
    [flattenedEntries]
  );
  const [page, setPage] = React.useState(1);

  const currentAnchor = useCurrentAnchor();

  useIsomorphicLayoutEffect(() => {
    const getPageFromHash = (): number => {
      if (!currentAnchor) {
        return 1;
      }

      /**
       * if the hash appears on an entry, navigate to page where the entry is located
       */
      const entryPageId = anchorIds[currentAnchor];
      if (entryPageId != null) {
        const entry = flattenedEntries.findIndex(
          (entry) => entry.pageId === entryPageId
        );
        if (entry !== -1) {
          return Math.floor(entry / CHANGELOG_PAGE_SIZE) + 1;
        }
      }

      const match = currentAnchor.match(/^page-(\d+)$/)?.[1];
      if (match == null) {
        return 1;
      }
      /**
       * Ensure the page number is within the bounds of the changelog entries
       */
      return Math.min(Math.max(parseInt(match, 10), 1), chunkedEntries.length);
    };

    setPage(getPageFromHash());
  }, [currentAnchor]);

  /**
   * Scroll to the top of the page when navigating to a new page of the changelog
   */
  const scrollBody = useAtomValue(SCROLL_BODY_ATOM);
  useEffect(() => {
    const element = document.getElementById(window.location.hash.slice(1));

    if (element != null) {
      element.scrollIntoView();
      return;
    }

    if (scrollBody instanceof Document) {
      window.scrollTo(0, 0);
    } else {
      scrollBody?.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const visibleEntries = chunkedEntries[page - 1] ?? EMPTY_ARRAY;

  const prev = useMemo(() => {
    if (page === 1) {
      return undefined;
    }

    return {
      href: `#page-${page - 1}`,
      shallow: true,
      onClick: () => {
        setPage(page - 1);
        window.scrollTo(0, 0);
      },
    };
  }, [page]);

  const next = useMemo(() => {
    if (page >= chunkedEntries.length) {
      return undefined;
    }

    return {
      title: "Older posts",
      href: `#page-${page + 1}`,
      shallow: true,
      onClick: () => {
        setPage(page + 1);
        window.scrollTo(0, 0);
      },
    };
  }, [chunkedEntries.length, page]);

  return (
    <article className="max-w-page-width-padded px-page-padding mx-auto min-w-0 flex-1">
      <SetLayout value="page" />
      <HideAsides force />
      <HideBuiltWithFern>
        <ChangelogContentLayout as="section" className="mb-8">
          {overview}
        </ChangelogContentLayout>

        {visibleEntries.map((entry) => {
          return (
            <Fragment key={entry.id}>
              <Separator className="max-w-content-width mx-auto my-12" />
              <ChangelogContentLayout
                as="article"
                id={entry.date}
                stickyContent={
                  <Badge asChild>
                    <FernLink href={addLeadingSlash(entry.slug)} scroll={true}>
                      {entry.title}
                    </FernLink>
                  </Badge>
                }
              >
                {entries[entry.pageId]}
              </ChangelogContentLayout>
            </Fragment>
          );
        })}
      </HideBuiltWithFern>
      <FooterLayout
        hideFeedback
        bottomNavigation={<BottomNavigationClient prev={prev} next={next} />}
      />
    </article>
  );
}
