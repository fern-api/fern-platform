"use client";

import { FernLink } from "@/components/link";
import type { FernNavigation } from "@fern-api/fdr-sdk";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import clsx from "clsx";
import { chunk } from "es-toolkit/array";
import { atom, useAtomValue } from "jotai";
import React, { Fragment, ReactElement, useEffect, useMemo } from "react";
import { useMemoOne } from "use-memo-one";
import {
  IS_READY_ATOM,
  LOCATION_ATOM,
  SCROLL_BODY_ATOM,
  SIDEBAR_ROOT_NODE_ATOM,
} from "../atoms";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import {
  BuiltWithFern,
  HideBuiltWithFernContext,
} from "../sidebar/BuiltWithFern";
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
}): ReactElement {
  const flattenedEntries = useMemo(() => flattenChangelogEntries(node), [node]);
  const chunkedEntries = useMemo(
    () => chunk(flattenedEntries, CHANGELOG_PAGE_SIZE),
    [flattenedEntries]
  );
  const page = useAtomValue(
    useMemoOne(() => {
      const pageAtom = atom((get) => {
        if (!get(IS_READY_ATOM)) {
          return 1;
        }

        const hash = get(LOCATION_ATOM).hash;
        if (hash == null) {
          return 1;
        }

        /**
         * if the hash appears on an entry, navigate to page where the entry is located
         */
        const entryPageId = anchorIds[hash.slice(1)];
        if (entryPageId != null) {
          const entry = flattenedEntries.findIndex(
            (entry) => entry.pageId === entryPageId
          );
          if (entry !== -1) {
            return Math.floor(entry / CHANGELOG_PAGE_SIZE) + 1;
          }
        }

        const match = hash.match(/^#page-(\d+)$/)?.[1];
        if (match == null) {
          return 1;
        }
        /**
         * Ensure the page number is within the bounds of the changelog entries
         */
        return Math.min(
          Math.max(parseInt(match, 10), 1),
          chunkedEntries.length
        );
      });
      return pageAtom;
    }, [anchorIds, flattenedEntries, chunkedEntries.length])
  );

  const fullWidth = useAtomValue(SIDEBAR_ROOT_NODE_ATOM) == null;

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
      title: "Newer posts",
      hint: "Next",
      href: `#page-${page - 1}`,
    };
  }, [page]);

  const next = useMemo(() => {
    if (page >= chunkedEntries.length) {
      return undefined;
    }

    return {
      title: "Older posts",
      hint: "Previous",
      href: `#page-${page + 1}`,
    };
  }, [chunkedEntries.length, page]);

  return (
    <div
      className={clsx("fern-changelog", {
        "full-width": fullWidth,
      })}
    >
      <main>
        <HideBuiltWithFernContext.Provider value={true}>
          <ChangelogContentLayout as="section" className="pb-8">
            {overview}
          </ChangelogContentLayout>

          {visibleEntries.map((entry) => {
            return (
              <Fragment key={entry.id}>
                <hr />
                <ChangelogContentLayout
                  as="article"
                  id={entry.date}
                  stickyContent={
                    <FernLink href={addLeadingSlash(entry.slug)}>
                      {entry.title}
                    </FernLink>
                  }
                >
                  {entries[entry.pageId]}
                </ChangelogContentLayout>
              </Fragment>
            );
          })}

          {(prev != null || next != null) && (
            <ChangelogContentLayout as="div">
              <BottomNavigationButtons prev={prev} next={next} alwaysShowGrid />
            </ChangelogContentLayout>
          )}
        </HideBuiltWithFernContext.Provider>

        <div className="h-48" />
        <BuiltWithFern className="mx-auto my-8 w-fit" />
      </main>
    </div>
  );
}
