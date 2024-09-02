import { ArrowLeft } from "iconoir-react";
import { ReactElement } from "react";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernLink } from "../components/FernLink";
import { useHref } from "../hooks/useHref";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export function ChangelogEntryPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogEntryPage }): ReactElement {
    const page = resolvedPath.page;
    const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
    const excerpt = typeof page !== "string" ? page?.frontmatter.subtitle ?? page?.frontmatter.excerpt : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="w-full min-w-0 pt-8">
                <article className="mx-auto break-words lg:ml-0 xl:mx-auto">
                    <section id={resolvedPath.date} className="flex items-stretch justify-between">
                        <div className="max-xl:hidden w-sidebar-width" />
                        <div className="relative mr-6 max-w-content-width min-w-0 shrink flex-1 max-xl:mx-auto">
                            <header className="mb-8">
                                <div className="space-y-1">
                                    <div className="not-prose">
                                        <FernLink href={useHref(resolvedPath.changelogSlug)}>
                                            <span className="t-accent shrink truncate whitespace-nowrap text-sm font-semibold inline-flex gap-1 items-center">
                                                <ArrowLeft className="size-icon" />
                                                Back to {resolvedPath.changelogTitle}
                                            </span>
                                        </FernLink>
                                    </div>

                                    <h1 className="my-0 inline-block leading-tight">{title ?? resolvedPath.title}</h1>
                                </div>

                                {excerpt != null && (
                                    <div className="prose prose-lg mt-2 leading-7 prose-p:t-muted dark:prose-invert">
                                        <MdxContent mdx={excerpt} />
                                    </div>
                                )}
                            </header>
                            {/* TODO: alert if the page is null */}
                            {page != null && (
                                <div className="prose dark:prose-invert">
                                    <MdxContent mdx={page} />
                                </div>
                            )}

                            <BottomNavigationButtons />
                        </div>
                        <div className="-mt-2 w-72 pl-4 text-right max-xl:hidden" />
                    </section>
                    <div className="h-48" />
                </article>
            </div>
        </div>
    );
}
