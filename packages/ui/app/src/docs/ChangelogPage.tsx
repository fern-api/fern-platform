import clsx from "clsx";
import { Fragment, ReactElement, useCallback, useEffect, useState } from "react";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useFilterContext } from "../contexts/filter-context/useFilterContext";
import { CustomDocsPageHeader } from "../custom-docs-page/CustomDocsPage";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";
import { FilterPanel } from "./FilterPanel";

export function ChangelogPage({ resolvedPath }: { resolvedPath: ResolvedPath.ChangelogPage }): ReactElement {
    const allEntries = resolvedPath.node.children.flatMap((year) =>
        year.children.flatMap((month) => month.children.map((entry) => entry)),
    );
    const { sidebar } = useDocsContext();
    const { activeFilters } = useFilterContext();
    const [filteredEntries, setFilteredEntries] = useState<object[]>(allEntries);
    const fullWidth = sidebar == null;
    const overview =
        resolvedPath.node.overviewPageId != null ? resolvedPath.pages[resolvedPath.node.overviewPageId] : undefined;

    const getYearsForFilterPanel = () => {
        const allYears = resolvedPath.node.children.flatMap((year) =>
            year.children.flatMap((month) => month.children.map((entry) => entry.title.split(", ")[1])),
        );
        return [...new Set(allYears)];
    };

    const getTagsForEntry = useCallback(
        (entry: object) => {
            let tags = [];
            const page = resolvedPath.pages[entry.pageId];
            if (page != null && typeof page !== "string") {
                tags = page.frontmatter.tags;
            }
            return tags;
        },
        [resolvedPath.pages],
    );

    const getTagsForFilterPanel = () => {
        const allTags = resolvedPath.node.children.flatMap((year) =>
            year.children.flatMap((month) =>
                month.children.reduce((acc, currentEntry) => {
                    let newAcc = [...acc];
                    const entryTags = getTagsForEntry(currentEntry);
                    if (entryTags?.length > 0) {
                        newAcc = [...acc, ...entryTags];
                    }
                    return newAcc;
                }, [] as string[]),
            ),
        );

        return allTags.length > 0 ? [...new Set(allTags)] : ["none"];
    };

    useEffect(() => {
        const getFilteredEntries = () => {
            let allFilteredEntries = [...allEntries];
            if (activeFilters.length > 0) {
                const filteredEntriesByTag = allEntries.filter((entry) => {
                    const entryTags = getTagsForEntry(entry);
                    return activeFilters.some((filter) => entryTags?.includes(filter));
                });

                const filterEntriesByYear = allEntries.filter((entry) => {
                    return activeFilters.some((filter) => entry.title.split(", ")[1] === filter);
                });

                allFilteredEntries = [...filteredEntriesByTag, ...filterEntriesByYear];
            }
            setFilteredEntries(allFilteredEntries);
        };
        getFilteredEntries();
    }, [activeFilters, allEntries, getTagsForEntry]);

    return (
        <div className="flex justify-between px-4 md:px-6 lg:px-8">
            <div className={clsx("w-full min-w-0 pt-8", { "sm:pt-8 lg:pt-24": fullWidth })}>
                <article className={clsx("mx-auto xl:w-fit break-words", { " xl:ml-8": !fullWidth })}>
                    <section className="flex">
                        {fullWidth ? (
                            <>
                                <div className="flex-initial max-md:hidden w-64" />
                                <div className="relative mr-6 max-w-content-width flex-auto">
                                    <CustomDocsPageHeader
                                        title={resolvedPath.node.title}
                                        sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                                        excerpt={
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
                                <CustomDocsPageHeader
                                    title={resolvedPath.node.title}
                                    sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                                    excerpt={typeof overview !== "string" ? overview?.frontmatter.excerpt : undefined}
                                />
                                {overview != null && (
                                    <section className="prose dark:prose-invertw-content-width">
                                        <MdxContent mdx={overview} />
                                    </section>
                                )}
                            </div>
                        )}
                        <div>
                            <FilterPanel
                                yearsArray={getYearsForFilterPanel()}
                                tagsArray={getTagsForFilterPanel()}
                                horizontal
                            />
                        </div>
                    </section>
                    {filteredEntries.map((entry) => {
                        const page = resolvedPath.pages[entry.pageId];
                        const title = typeof page !== "string" ? page?.frontmatter.title : undefined;
                        return (
                            <Fragment key={entry.id}>
                                <hr className="mt-8 mb-16" />
                                <section id={entry.date} className="flex items-stretch">
                                    {fullWidth ? (
                                        <>
                                            <div className="flex-initial max-md:hidden min-w-64">
                                                <div className="sticky top-header-height-padded t-muted text-base mb-8">
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
                                                <span className="t-muted text-base sticky top-header-height-padded">
                                                    <FernLink href={`/${entry.slug}`}>{entry.title}</FernLink>
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </section>
                            </Fragment>
                        );
                    })}
                    ,
                    <div className="h-48" />
                </article>
            </div>
            <div className="w-1/4 max-lg:hidden">
                <FilterPanel yearsArray={getYearsForFilterPanel()} tagsArray={getTagsForFilterPanel()} />
            </div>
        </div>
    );
}
