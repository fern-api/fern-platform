import { ReactElement } from "react";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernLink } from "../components/FernLink";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export function ChangelogEntryPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogEntryPage }): ReactElement {
    const page = resolvedPath.pages[resolvedPath.node.pageId];
    const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
    const excerpt = typeof page !== "string" ? page?.frontmatter.subtitle ?? page.frontmatter.excerpt : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="w-full min-w-0 pt-8">
                <article className="mx-auto w-fit break-words lg:ml-0 xl:mx-auto">
                    <section id={resolvedPath.node.date} className="flex items-stretch">
                        <div className="prose relative mr-6 max-w-content-width flex-1 dark:prose-invert">
                            <header className="mb-8">
                                <div className="space-y-1">
                                    <div className="not-prose">
                                        <FernLink href={`/${resolvedPath.changelogSlug}`}>
                                            <span className="t-accent shrink truncate whitespace-nowrap text-sm font-semibold">
                                                {resolvedPath.changelogTitle}
                                            </span>
                                        </FernLink>
                                    </div>

                                    <h1 className="my-0 inline-block leading-tight">
                                        {title ?? resolvedPath.node.title}
                                    </h1>
                                </div>

                                {excerpt != null && (
                                    <div className="prose prose-lg mt-2 leading-7 prose-p:t-muted dark:prose-invert">
                                        <MdxContent mdx={excerpt} />
                                    </div>
                                )}
                            </header>
                            <MdxContent mdx={page} />
                        </div>
                        <div className="-mt-2 w-72 pl-4 text-right">
                            {/* <span className="t-muted text-base sticky top-header-height-padded">
                                {resolvedPath.node.title}
                            </span> */}
                        </div>
                    </section>

                    <div className="max-w-content-width">
                        <BottomNavigationButtons />
                    </div>
                    <div className="h-36" />
                </article>
            </div>
        </div>
    );
}
