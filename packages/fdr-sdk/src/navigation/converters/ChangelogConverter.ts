import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

dayjs.extend(utc);

export class ChangelogNavigationConverter {
    public static convert(
        changelog: DocsV1Read.ChangelogSection,
        noindexMap: Record<FernNavigation.PageId, boolean>,
        slug: SlugGenerator,
        idgen: NodeIdGenerator,
    ): FernNavigation.ChangelogNode {
        return new ChangelogNavigationConverter(idgen, noindexMap).convert(changelog, slug);
    }

    #idgen: NodeIdGenerator;
    private constructor(
        idgen: NodeIdGenerator,
        private noindexMap: Record<FernNavigation.PageId, boolean>,
    ) {
        this.#idgen = idgen;
    }

    private convert(changelog: DocsV1Read.ChangelogSection, parentSlug: SlugGenerator): FernNavigation.ChangelogNode {
        return this.#idgen.with("log", (id) => {
            const slug = parentSlug.apply(changelog);
            const overviewPageId = changelog.pageId != null ? FernNavigation.PageId(changelog.pageId) : undefined;
            const noindex = overviewPageId != null ? this.noindexMap[overviewPageId] : undefined;
            return {
                id,
                type: "changelog",
                title: changelog.title ?? "Changelog",
                overviewPageId,
                noindex,
                slug: slug.get(),
                icon: changelog.icon,
                hidden: changelog.hidden,
                children: this.convertYear(changelog.items, slug),
            };
        });
    }

    private convertYear(items: DocsV1Read.ChangelogItem[], slug: SlugGenerator): FernNavigation.ChangelogYearNode[] {
        const entries = orderBy(
            items.map((item) => this.convertChangelogEntry(item, slug)),
            (entry) => entry.date,
            "desc",
        );
        return this.groupByYear(entries, slug);
    }
    private groupByYear(
        entries: FernNavigation.ChangelogEntryNode[],
        parentSlug: SlugGenerator,
    ): FernNavigation.ChangelogYearNode[] {
        const years = new Map<number, FernNavigation.ChangelogEntryNode[]>();
        for (const entry of entries) {
            const year = dayjs.utc(entry.date).year();
            const yearEntries = years.get(year) ?? [];
            yearEntries.push(entry);
            years.set(year, yearEntries);
        }
        return orderBy(
            Array.from(years.entries()).map(([year, entries]) =>
                this.#idgen.with(year.toString(), (id) => {
                    const slug = parentSlug.append(year.toString());
                    return {
                        id,
                        type: "changelogYear" as const,
                        title: year.toString(),
                        year,
                        slug: slug.get(),
                        icon: undefined,
                        hidden: undefined,
                        children: this.groupByMonth(entries, slug),
                    };
                }),
            ),
            "year",
            "desc",
        );
    }

    private groupByMonth(
        entries: FernNavigation.ChangelogEntryNode[],
        parentSlug: SlugGenerator,
    ): FernNavigation.ChangelogMonthNode[] {
        const months = new Map<number, FernNavigation.ChangelogEntryNode[]>();
        for (const entry of entries) {
            const month = dayjs.utc(entry.date).month() + 1;
            const monthEntries = months.get(month) ?? [];
            monthEntries.push(entry);
            months.set(month, monthEntries);
        }
        return orderBy(
            Array.from(months.entries()).map(([month, entries]) =>
                this.#idgen.with(month.toString(), (id) => ({
                    id,
                    type: "changelogMonth" as const,
                    title: dayjs(new Date(0, month - 1)).format("MMMM YYYY"),
                    month,
                    slug: parentSlug.append(month.toString()).get(),
                    icon: undefined,
                    hidden: undefined,
                    children: entries,
                })),
            ),
            "month",
            "desc",
        );
    }

    private convertChangelogEntry(
        item: DocsV1Read.ChangelogItem,
        parentSlug: SlugGenerator,
    ): FernNavigation.ChangelogEntryNode {
        const date = dayjs.utc(item.date);
        return this.#idgen.with(date.format("YYYY-M-D"), (id) => {
            const pageId = FernNavigation.PageId(item.pageId);
            const noindex = this.noindexMap[pageId];
            return {
                id,
                type: "changelogEntry",
                title: date.format("MMMM D, YYYY"),
                date: item.date,
                pageId,
                noindex,
                slug: parentSlug.append(date.format("YYYY/M/D")).get(),
                icon: undefined,
                hidden: undefined,
            };
        });
    }
}

function orderBy<K extends string, T extends Record<K, string | number>>(
    items: T[],
    key: K,
    order?: "asc" | "desc",
): T[];
function orderBy<T>(items: T[], key: (item: T) => string | number, order?: "asc" | "desc"): T[];
function orderBy<K extends string, T extends Record<K, string | number>>(
    items: T[],
    key: K | ((item: T) => string | number),
    order: "asc" | "desc" = "asc",
): T[] {
    return items.concat().sort((a, b) => {
        const aValue = typeof key === "function" ? key(a) : a[key];
        const bValue = typeof key === "function" ? key(b) : b[key];
        if (aValue < bValue) {
            return order === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return order === "asc" ? 1 : -1;
        }
        return 0;
    });
}
