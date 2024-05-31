import { format, parseISO } from "date-fns";
import { orderBy } from "lodash-es";
import urljoin from "url-join";
import { DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";
import { createSlug } from "../utils/createSlug";
import { NodeIdGenerator } from "./NodeIdGenerator";

interface ChangelogEntryNodeWithDate extends Omit<FernNavigation.ChangelogEntryNode, "date"> {
    date: Date;
}

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
    private groupByYear(entries: ChangelogEntryNodeWithDate[], parentSlug: string): FernNavigation.ChangelogYearNode[] {
        const years = new Map<number, ChangelogEntryNodeWithDate[]>();
        for (const entry of entries) {
            const year = entry.date.getFullYear();
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
                        type: "changelogYear",
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
        entries: ChangelogEntryNodeWithDate[],
        parentSlug: string,
    ): FernNavigation.ChangelogMonthNode[] {
        const months = new Map<number, ChangelogEntryNodeWithDate[]>();
        for (const entry of entries) {
            const month = entry.date.getMonth() + 1;
            const monthEntries = months.get(month) ?? [];
            monthEntries.push(entry);
            months.set(month, monthEntries);
        }
        return orderBy(
            Array.from(months.entries()).map(([month, entries]) =>
                this.#idgen.with(month.toString(), (id) => ({
                    id,
                    type: "changelogMonth",
                    title: format(new Date(0, month - 1), "MMMM yyyy"),
                    month,
                    slug: FernNavigation.Slug(urljoin(parentSlug, month.toString())),
                    icon: undefined,
                    hidden: undefined,
                    children: entries.map(toEntry),
                })),
            ),
            "month",
            "desc",
        );
    }

    private convertChangelogEntry(item: DocsV1Read.ChangelogItem, parentSlug: string): ChangelogEntryNodeWithDate {
        const date = parseISO(item.date);
        return this.#idgen.with(format(date, "yyyy-M-d"), (id) => {
            return {
                id,
                type: "changelogEntry",
                title: format(date, "MMMM d, yyyy"),
                date,
                pageId: FernNavigation.PageId(item.pageId),
                slug: FernNavigation.Slug(urljoin(parentSlug, format(date, "yyyy/M/d"))),
                icon: undefined,
                hidden: undefined,
            };
        });
    }
}

function toEntry(node: ChangelogEntryNodeWithDate): FernNavigation.ChangelogEntryNode {
    return {
        id: node.id,
        type: "changelogEntry",
        title: node.title,
        date: node.date.toISOString(),
        pageId: node.pageId,
        slug: node.slug,
        icon: node.icon,
        hidden: node.hidden,
    };
}
