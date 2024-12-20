import type { FernNavigation } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import clsx from "clsx";
import { chunk } from "es-toolkit/array";
import { atom, useAtomValue } from "jotai";
import { Fragment, ReactElement, useEffect, useMemo } from "react";
import { useMemoOne } from "use-memo-one";
import {
  IS_READY_ATOM,
  LOCATION_ATOM,
  SCROLL_BODY_ATOM,
  SIDEBAR_ROOT_NODE_ATOM,
} from "../atoms";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { useToHref } from "../hooks/useHref";
import { Markdown } from "../mdx/Markdown";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ChangelogContentLayout } from "./ChangelogContentLayout";

function flattenChangelogEntries(
  page: DocsContent.ChangelogPage
): FernNavigation.ChangelogEntryNode[] {
  return page.node.children.flatMap((year) =>
    year.children.flatMap((month) => month.children)
  );
}

const CHANGELOG_PAGE_SIZE = 10;

function getOverviewMdx(
  page: DocsContent.ChangelogPage
): FernDocs.MarkdownText | undefined {
  return page.node.overviewPageId != null
    ? page.pages[page.node.overviewPageId]
    : undefined;
}

export function ChangelogPage({
  content,
}: {
  content: DocsContent.ChangelogPage;
}): ReactElement {
  const flattenedEntries = useMemo(
    () => flattenChangelogEntries(content),
    [content]
  );
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
        const entryPageId = content.anchorIds[hash.slice(1)];
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
    }, [content.anchorIds, flattenedEntries, chunkedEntries.length])
  );

  const overview = getOverviewMdx(content);

  const toHref = useToHref();
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

  const entries = chunkedEntries[page - 1] ?? EMPTY_ARRAY;

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
        <ChangelogContentLayout as="section" className="pb-8">
          <PageHeader
            title={content.node.title}
            breadcrumb={content.breadcrumb}
            subtitle={
              typeof overview !== "string"
                ? overview?.frontmatter.excerpt
                : undefined
            }
          />
          <Markdown mdx={overview} />
        </ChangelogContentLayout>

        {entries.map((entry) => {
          const page = content.pages[entry.pageId];
          const title =
            typeof page !== "string" ? page?.frontmatter.title : undefined;
          return (
            <Fragment key={entry.id}>
              <hr />
              <ChangelogContentLayout
                as="article"
                id={entry.date}
                stickyContent={
                  <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                }
              >
                <Markdown
                  title={
                    title != null ? (
                      <h2>
                        <FernLink
                          href={toHref(entry.slug)}
                          className="not-prose"
                        >
                          {title}
                        </FernLink>
                      </h2>
                    ) : undefined
                  }
                  mdx={page}
                />
              </ChangelogContentLayout>
            </Fragment>
          );
        })}

        {(prev != null || next != null) && (
          <ChangelogContentLayout as="div">
            <BottomNavigationButtons prev={prev} next={next} alwaysShowGrid />
          </ChangelogContentLayout>
        )}

        <div className="h-48" />
        <div className="mx-auto my-8 w-fit">
          <BuiltWithFern />
        </div>
      </main>
    </div>
  );
}
