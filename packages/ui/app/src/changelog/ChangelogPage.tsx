import clsx from "clsx";
import { Fragment, ReactElement } from "react";
import { useSidebarNodes } from "../atoms";
import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { useToHref } from "../hooks/useHref";
import { Markdown } from "../mdx/Markdown";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

export function ChangelogPage({ content }: { content: DocsContent.ChangelogPage }): ReactElement {
    const sidebar = useSidebarNodes();
    const toHref = useToHref();
    const fullWidth = sidebar == null;
    const overview = content.node.overviewPageId != null ? content.pages[content.node.overviewPageId] : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:px-8">
            <div className={clsx("w-full min-w-0 pt-8", { "sm:pt-8 lg:pt-24": fullWidth })}>
                <main className={clsx("mx-auto max-w-screen-lg break-words", { " xl:ml-8": !fullWidth })}>
                    <section className="flex">
                        {fullWidth ? (
                            <>
                                <div className="flex-initial max-md:hidden w-64" />
                                <div className="relative mr-6 max-w-content-width min-w-0 shrink flex-auto">
                                    <PageHeader
                                        title={content.node.title}
                                        breadcrumbs={content.breadcrumbs}
                                        subtitle={
                                            typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined
                                        }
                                    />
                                    <Markdown mdx={overview} />
                                </div>
                            </>
                        ) : (
                            <div className="relative mr-6 max-w-content-width min-w-0 shrink flex-auto">
                                <PageHeader
                                    title={content.node.title}
                                    breadcrumbs={content.breadcrumbs}
                                    subtitle={typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined}
                                />
                                <Markdown mdx={overview} />
                            </div>
                        )}
                    </section>

                    {content.node.children.flatMap((year) =>
                        year.children.flatMap((month) =>
                            month.children.map((entry) => {
                                const page = content.pages[entry.pageId];
                                const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
                                return (
                                    <Fragment key={entry.id}>
                                        <hr className="mt-8 mb-16" />
                                        <article id={entry.date} className="flex items-stretch">
                                            {fullWidth ? (
                                                <>
                                                    <div className="flex-initial max-md:hidden min-w-64">
                                                        <div className="sticky top-header-offset-padded t-muted text-base mb-8">
                                                            <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                        </div>
                                                    </div>
                                                    <div className="relative mr-6 max-w-full flex-auto min-w-0 shrink">
                                                        <div className="t-muted text-base mb-8 xl:hidden md:hidden">
                                                            <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                        </div>
                                                        <Markdown title={title} mdx={page} />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="relative mr-6 max-w-full flex-auto max-xl:mx-auto">
                                                        <div className="t-muted text-base mb-8 xl:hidden">
                                                            <FernLink href={toHref(entry.slug)}>{entry.title}</FernLink>
                                                        </div>
                                                        <Markdown title={title} mdx={page} />
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
                            }),
                        ),
                    )}

                    <div className="h-48" />
                    <BuiltWithFern className="w-fit mx-auto my-8" />
                </main>
            </div>
        </div>
    );
}
