import moment from "moment";
import { ReactElement } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { CustomDocsPageHeader } from "../custom-docs-page/CustomDocsPage";
import { TableOfContentsContextProvider } from "../custom-docs-page/TableOfContentsContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../util/ResolvedPath";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    // const editThisPage = resolvedPath.markdown?.frontmatter.editThisPageUrl ?? resolvedPath?.editThisPageUrl;
    // const tableOfContents = useMemo(
    //     () =>
    //         resolvedPath.items.map(
    //             (item): TableOfContentsItem => ({
    //                 simpleString: item.dateString,
    //                 anchorString: item.date,
    //                 children: [],
    //             }),
    //         ),
    //     [resolvedPath.items],
    // );
    return (
        <TableOfContentsContextProvider>
            <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
                <div className="w-full min-w-0 pt-8">
                    <article className="mx-auto w-fit break-words lg:ml-0 xl:mx-auto">
                        <section className="prose dark:prose-invert prose-h1:mt-[1.5em]">
                            <CustomDocsPageHeader
                                title={resolvedPath.title}
                                sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
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
                                <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h2:mt-0 first:prose-h1:mt-0 w-content-width relative mr-8 flex-1">
                                    <div className="absolute -right-4 flex h-full w-[10px] items-start justify-center">
                                        <div className="bg-accent z-10 h-2 w-2 rounded-full" />
                                        <div className="bg-border-default z-5 absolute h-full w-0.5" />
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
                {/* <aside
                    id="right-sidebar"
                    className="top-header-height h-vh-minus-header sticky hidden w-[18rem] shrink-0  xl:block"
                >
                    <FernScrollArea viewportClassName="px-4 lg:pr-8 pb-12 pt-8">
                        <TableOfContents tableOfContents={tableOfContents} />
                        {editThisPage != null && (
                            <Link
                                href={editThisPage}
                                target="_blank"
                                className="t-muted hover:dark:text-text-default-dark hover:text-text-default-light my-3 block hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline"
                            >
                                Edit this page
                            </Link>
                        )}
                        <Feedback className="sticky top-full" />
                    </FernScrollArea>
                </aside> */}
            </div>
        </TableOfContentsContextProvider>
    );
}
