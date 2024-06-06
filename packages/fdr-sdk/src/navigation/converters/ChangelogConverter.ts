import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import urljoin from "url-join";
import { DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";
import { createSlug } from "../utils/createSlug";
import { NodeIdGenerator } from "./NodeIdGenerator";

dayjs.extend(utc);

export class ChangelogNavigationConverter {
    public static convert(
        changelog: DocsV1Read.ChangelogSection,
        baseSlug: string,
        parentSlug: string,
        idgen: NodeIdGenerator,
    ): FernNavigation.ChangelogNode {
        return new ChangelogNavigationConverter(idgen).convert(changelog, baseSlug, parentSlug);
    }

    #idgen: NodeIdGenerator;
    private constructor(idgen: NodeIdGenerator) {
        this.#idgen = idgen;
    }

    private convert(
        changelog: DocsV1Read.ChangelogSection,
        baseSlug: string,
        parentSlug: string,
    ): FernNavigation.ChangelogNode {
        return this.#idgen.with("log", (id) => {
            const slug = createSlug(baseSlug, parentSlug, changelog);
            return {
                id,
                type: "changelog",
                title: changelog.title ?? "Changelog",
                overviewPageId: changelog.pageId != null ? FernNavigation.PageId(changelog.pageId) : undefined,
                slug,
                icon: changelog.icon,
                hidden: changelog.hidden,
                children: this.convertYear(changelog.items, slug),
            };
        });
    }

    private convertYear(items: DocsV1Read.ChangelogItem[], parentSlug: string): FernNavigation.ChangelogYearNode[] {
        const entries = orderBy(
            items.map((item) => this.convertChangelogEntry(item, parentSlug)),
            (entry) => entry.date,
            "desc",
        );
        return this.groupByYear(entries, parentSlug);
    }
    private groupByYear(
        entries: FernNavigation.ChangelogEntryNode[],
        parentSlug: string,
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
                    const slug = FernNavigation.Slug(urljoin(parentSlug, year.toString()));
                    return {
                        id,
                        type: "changelogYear" as const,
                        title: year.toString(),
                        year,
                        slug,
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
        parentSlug: string,
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
                    slug: FernNavigation.Slug(urljoin(parentSlug, month.toString())),
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
        parentSlug: string,
    ): FernNavigation.ChangelogEntryNode {
        const date = dayjs.utc(item.date);
        return this.#idgen.with(date.format("YYYY-M-D"), (id) => {
            return {
                id,
                type: "changelogEntry",
                title: date.format("MMMM D, YYYY"),
                date: item.date,
                pageId: FernNavigation.PageId(item.pageId),
                slug: FernNavigation.Slug(urljoin(parentSlug, date.format("YYYY/M/D"))),
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
