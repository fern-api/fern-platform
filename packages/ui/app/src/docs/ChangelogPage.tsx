import moment from "moment";
import { ReactElement } from "react";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { CustomDocsPageHeader } from "../custom-docs-page/CustomDocsPage";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="w-full min-w-0 pt-8">
                <article className="mx-auto w-fit break-words lg:ml-0 xl:mx-auto">
                    <section className="prose dark:prose-invert prose-h1:mt-[1.5em]">
                        <CustomDocsPageHeader
                            title={resolvedPath.title}
                            sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                            excerpt={
                                typeof resolvedPath.markdown !== "string"
                                    ? resolvedPath.markdown?.frontmatter.excerpt
                                    : undefined
                            }
                        />
                        {resolvedPath.markdown != null && (
                            <section>
                                <MdxContent mdx={resolvedPath.markdown} />
                                <hr />
                            </section>
                        )}
                    </section>

                    {resolvedPath.items.map((item) => (
                        <section key={item.date} id={item.date} className="flex items-start">
                            <div className="prose relative mr-8 w-content-width flex-1 dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 first:prose-h2:mt-0">
                                <div className="absolute -right-4 flex h-full w-[10px] items-start justify-center">
                                    <div className="bg-accent z-10 h-2 w-2 rounded-full" />
                                    <div className="z-5 absolute h-full w-0.5 bg-border-default" />
                                </div>
                                <div className="pb-16">
                                    {
                                        <h2>
                                            {(typeof item.markdown !== "string"
                                                ? item.markdown.frontmatter.title
                                                : undefined) ?? item.dateString}
                                        </h2>
                                    }
                                    <MdxContent mdx={item.markdown} />
                                </div>
                            </div>
                            <div className="-mt-2 w-[18rem]">
                                <span className="t-muted text-base">{moment(item.date).format("MMM DD YYYY")}</span>
                            </div>
                        </section>
                    ))}

                    <div className="max-w-content-width">
                        <BottomNavigationButtons />
                    </div>
                    <div className="h-20" />
                </article>
            </div>
        </div>
    );
}
