import clsx from "clsx";
import { Fragment, ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { CustomDocsPageHeader } from "../custom-docs-page/CustomDocsPage";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    const { sidebar } = useDocsContext();
    const fullWidth = sidebar == null;
    const overview =
        resolvedPath.node.overviewPageId != null ? resolvedPath.pages[resolvedPath.node.overviewPageId] : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className={clsx("w-full min-w-0 pt-8", { "sm:pt-16 lg:pt-32": fullWidth })}>
                <article className="mx-auto xl:w-fit break-words lg:ml-0 xl:mx-auto">
                    <section className="flex">
                        {fullWidth && <div className="max-xl:hidden w-sidebar-width" />}
                        <div className="max-w-content-width w-full max-xl:mx-auto">
                            <CustomDocsPageHeader
                                title={resolvedPath.node.title}
                                sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                                excerpt={typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined}
                            />
                            {overview != null && (
                                <section className="prose w-content-width dark:prose-invert">
                                    <MdxContent mdx={overview} />
                                </section>
                            )}
                        </div>
                    </section>

                    {resolvedPath.node.children.flatMap((year) =>
                        year.children.flatMap((month) =>
                            month.children.map((entry) => {
                                const page = resolvedPath.pages[entry.pageId];
                                const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
                                return (
                                    <Fragment key={entry.id}>
                                        <hr className="my-16" />
                                        <section id={entry.date} className="flex items-stretch">
                                            {fullWidth && <div className="max-xl:hidden w-sidebar-width" />}
                                            <div className="relative mr-6 max-w-content-width flex-1 max-xl:mx-auto">
                                                <div className="t-muted text-base mb-8 xl:hidden">
                                                    <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                </div>
                                                <div className="prose dark:prose-invert">
                                                    {title != null && <h1>{title}</h1>}
                                                    <MdxContent mdx={page} />
                                                </div>
                                            </div>
                                            <div className="-mt-2 w-72 pl-4 text-right max-xl:hidden">
                                                <span className="t-muted text-base sticky top-header-height-padded">
                                                    <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                </span>
                                            </div>
                                        </section>
                                    </Fragment>
                                );
                            }),
                        ),
                    )}
                    <div className="h-48" />
                </article>
            </div>
        </div>
    );
}
