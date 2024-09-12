import type { FernNavigation } from "@fern-api/fdr-sdk";
import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { usePrevious } from "@fern-ui/react-commons";
import clsx from "clsx";
import { SetStateAction, atom, useAtom, useAtomValue } from "jotai";
import { chunk } from "lodash-es";
import { Fragment, PropsWithChildren, ReactElement, useEffect, useMemo } from "react";
import { DISABLE_SIDEBAR_ATOM, IS_READY_ATOM, LOCATION_ATOM, SCROLL_BODY_ATOM } from "../atoms";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { useToHref } from "../hooks/useHref";
import { Markdown } from "../mdx/Markdown";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

function flattenChangelogEntries(page: DocsContent.ChangelogPage): FernNavigation.ChangelogEntryNode[] {
    return page.node.children.flatMap((year) => year.children.flatMap((month) => month.children));
}

const CHANGELOG_PAGE_SIZE = 10;
const CHANGELOG_PAGE_ATOM = atom(
    (get) => {
        if (!get(IS_READY_ATOM)) {
            return 0;
        }

        const hash = get(LOCATION_ATOM).hash;
        if (hash == null) {
            return 0;
        }
        const match = hash.match(/^#page-(\d+)$/)?.[1];
        if (match == null) {
            return 0;
        }
        return Math.max(parseInt(match, 10) - 1, 0);
    },
    (get, set, page: SetStateAction<number>) => {
        const newPage = typeof page === "function" ? page(get(CHANGELOG_PAGE_ATOM)) : page;
        set(LOCATION_ATOM, { hash: newPage > 0 ? `#page-${newPage + 1}` : "" }, { replace: false });
    },
);

function ChangelogContentLayout({ children }: PropsWithChildren) {
    const fullWidth = useAtomValue(DISABLE_SIDEBAR_ATOM);
    return fullWidth ? (
        <>
            <div className="flex-initial max-md:hidden w-64" />
            <div className="relative max-w-content-width min-w-0 shrink flex-auto">{children}</div>
        </>
    ) : (
        <div className="relative mr-6 max-w-content-width min-w-0 shrink flex-auto">{children}</div>
    );
}

export function ChangelogPage({ content }: { content: DocsContent.ChangelogPage }): ReactElement {
    const toHref = useToHref();
    const fullWidth = useAtomValue(DISABLE_SIDEBAR_ATOM);

    const overview = content.node.overviewPageId != null ? content.pages[content.node.overviewPageId] : undefined;

    const chunkedEntries = useMemo(() => chunk(flattenChangelogEntries(content), CHANGELOG_PAGE_SIZE), [content]);

    const [page, setPage] = useAtom(CHANGELOG_PAGE_ATOM);

    /**
     * Reset paging when navigating between different changelog pages
     */
    const prevousNodeId = usePrevious(content.node.id);
    useEffect(() => {
        if (prevousNodeId !== content.node.id) {
            setPage(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevousNodeId, content.node.id]);

    /**
     * Ensure that the page is within bounds
     */
    useEffect(() => {
        setPage((prev) => Math.min(prev, chunkedEntries.length - 1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chunkedEntries.length]);

    /**
     * Scroll to the top of the page when navigating to a new page of the changelog
     */
    const scrollBody = useAtomValue(SCROLL_BODY_ATOM);
    useEffect(() => {
        if (scrollBody instanceof Document) {
            window.scrollTo(0, 0);
        } else {
            scrollBody?.scrollTo(0, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const entries = chunkedEntries[page] ?? EMPTY_ARRAY;

    const prev = useMemo(() => {
        if (page === 0) {
            return undefined;
        }

        return {
            title: "Newer posts",
            hint: "Next",
            onClick: () => setPage((prev) => prev - 1),
        };
    }, [page, setPage]);

    const next = useMemo(() => {
        if (page === chunkedEntries.length - 1) {
            return undefined;
        }

        return {
            title: "Older posts",
            hint: "Previous",
            onClick: () => setPage((prev) => prev + 1),
        };
    }, [chunkedEntries.length, page, setPage]);

    return (
        <div className="flex justify-between px-4 md:px-6 lg:px-8">
            <div className={clsx("w-full min-w-0 pt-8", { "sm:pt-8 lg:pt-24": fullWidth })}>
                <main className={clsx("mx-auto max-w-screen-lg break-words", { " xl:ml-8": !fullWidth })}>
                    <section className="flex pb-8">
                        <ChangelogContentLayout>
                            <PageHeader
                                title={content.node.title}
                                breadcrumbs={content.breadcrumbs}
                                subtitle={typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined}
                            />
                            <Markdown mdx={overview} />
                        </ChangelogContentLayout>
                    </section>

                    {entries.map((entry) => {
                        const page = content.pages[entry.pageId];
                        const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
                        return (
                            <Fragment key={entry.id}>
                                <hr />
                                <article id={entry.date} className="flex items-stretch py-16 max-lg:py-8">
                                    {fullWidth ? (
                                        <>
                                            <div className="flex-initial max-md:hidden min-w-64">
                                                <div className="sticky top-header-offset-padded t-muted text-base mb-8">
                                                    <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                </div>
                                            </div>
                                            <div className="relative mr-6 max-w-content-width flex-auto min-w-0 shrink">
                                                <div className="t-muted text-base mb-8 xl:hidden md:hidden">
                                                    <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                </div>
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
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative mr-6 max-w-full flex-auto max-xl:mx-auto">
                                                <div className="t-muted text-base mb-8 xl:hidden">
                                                    <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                </div>
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
                                            </div>
                                            <div className="-mt-2 w-72 pl-4 text-right max-xl:hidden">
                                                <span className="t-muted text-base sticky top-header-offset-padded">
                                                    <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </article>
                            </Fragment>
                        );
                    })}

                    {(prev != null || next != null) && (
                        <div className="flex">
                            <ChangelogContentLayout>
                                <BottomNavigationButtons prev={prev} next={next} alwaysShowGrid />
                            </ChangelogContentLayout>
                        </div>
                    )}

                    <div className="h-48" />
                    <BuiltWithFern className="w-fit mx-auto my-8" />
                </main>
            </div>
        </div>
    );
}
