import clsx from "clsx";
import { Fragment, ReactElement } from "react";
import { useSidebarNodes } from "../atoms/navigation";
import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    const sidebar = useSidebarNodes();
    const fullWidth = sidebar == null;
    const overview =
        resolvedPath.node.overviewPageId != null ? resolvedPath.pages[resolvedPath.node.overviewPageId] : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:px-8">
            <div className={clsx("w-full min-w-0 pt-8", { "sm:pt-8 lg:pt-24": fullWidth })}>
                <main className={clsx("mx-auto max-w-screen-lg break-words", { " xl:ml-8": !fullWidth })}>
                    <section className="flex">
                        {fullWidth ? (
                            <>
                                <div className="flex-initial max-md:hidden w-64" />
                                <div className="relative mr-6 max-w-content-width flex-auto">
                                    <PageHeader
                                        title={resolvedPath.node.title}
                                        breadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                                        subtitle={
                                            typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined
                                        }
                                    />
                                    {overview != null && (
                                        <section className="prose dark:prose-invert">
                                            <MdxContent mdx={overview} />
                                        </section>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="relative mr-6 max-w-content-width flex-auto">
                                <PageHeader
                                    title={resolvedPath.node.title}
                                    breadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                                    subtitle={typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined}
                                />
                                {overview != null && (
                                    <section className="prose dark:prose-invertw-content-width">
                                        <MdxContent mdx={overview} />
                                    </section>
                                )}
                            </div>
                        )}
                    </section>

                    {resolvedPath.node.children.flatMap((year) =>
                        year.children.flatMap((month) =>
                            month.children.map((entry) => {
                                const page = resolvedPath.pages[entry.pageId];
                                const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
                                return (
                                    <Fragment key={entry.id}>
                                        <hr className="mt-8 mb-16" />
                                        <article id={entry.date} className="flex items-stretch">
                                            {fullWidth ? (
                                                <>
                                                    <div className="flex-initial max-md:hidden min-w-64">
                                                        <div className="sticky top-header-offset-padded t-muted text-base mb-8">
                                                            <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                        </div>
                                                    </div>
                                                    <div className="relative mr-6 max-w-full flex-auto">
                                                        <div className="t-muted text-base mb-8 xl:hidden md:hidden">
                                                            <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                        </div>
                                                        <div className="prose dark:prose-invert">
                                                            {title != null && <h1>{title}</h1>}
                                                            <MdxContent mdx={page} />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="relative mr-6 max-w-full flex-auto max-xl:mx-auto">
                                                        <div className="t-muted text-base mb-8 xl:hidden">
                                                            <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                        </div>
                                                        <div className="prose dark:prose-invert">
                                                            {title != null && <h1>{title}</h1>}
                                                            <MdxContent mdx={page} />
                                                        </div>
                                                    </div>
                                                    <div className="-mt-2 w-72 pl-4 text-right max-xl:hidden">
                                                        <span className="t-muted text-base sticky top-header-offset-padded">
                                                            <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
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
