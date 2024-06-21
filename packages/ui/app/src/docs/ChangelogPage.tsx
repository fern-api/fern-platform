import { Fragment, ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { CustomDocsPageHeader } from "../custom-docs-page/CustomDocsPage";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    const overview =
        resolvedPath.node.overviewPageId != null ? resolvedPath.pages[resolvedPath.node.overviewPageId] : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="w-full min-w-0 pt-8">
                <article className="mx-auto w-fit break-words lg:ml-0 xl:mx-auto">
                    <section className="prose dark:prose-invert prose-h1:mt-[1.5em]">
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
                                            <div className="prose relative mr-6 max-w-content-width flex-1 dark:prose-invert">
                                                {title != null && <h2>{title}</h2>}
                                                <MdxContent mdx={page} />
                                            </div>
                                            <div className="-mt-2 w-72 pl-4 text-right">
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

                    {/* <div className="max-w-content-width">
                        <BottomNavigationButtons />
                    </div> */}
                    <div className="h-36" />
                </article>
            </div>
        </div>
    );
}
