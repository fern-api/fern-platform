import { format, parseISO } from "date-fns";
import { orderBy } from "lodash-es";
import { DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";
import { createSlug } from "../utils/createSlug";

interface ChangelogEntryNodeWithDate extends Omit<FernNavigation.ChangelogEntryNode, "date"> {
    date: Date;
}

export class ChangelogNavigationConverter {
    public static convert(
        changelog: DocsV1Read.ChangelogSection,
        baseSlug: string[],
        parentSlug: string[],
    ): FernNavigation.ChangelogNode {
        const slug = createSlug(baseSlug, parentSlug, changelog);
        return {
            type: "changelog",
            title: changelog.title ?? "Changelog",
            overviewPageId: changelog.pageId != null ? FernNavigation.PageId(changelog.pageId) : undefined,
            slug,
            icon: changelog.icon,
            hidden: changelog.hidden,
            children: ChangelogNavigationConverter.convertYear(changelog.items, slug),
        };
    }

    private static convertYear(
        items: DocsV1Read.ChangelogItem[],
        parentSlug: string[],
    ): FernNavigation.ChangelogYearNode[] {
        const entries = orderBy(
            items.map((item) => ChangelogNavigationConverter.convertChangelogEntry(item, parentSlug)),
            (entry) => entry.date,
            "desc",
        );
        return ChangelogNavigationConverter.groupByYear(entries, parentSlug);
    }
    private static groupByYear(
        entries: ChangelogEntryNodeWithDate[],
        parentSlug: string[],
    ): FernNavigation.ChangelogYearNode[] {
        const years = new Map<number, ChangelogEntryNodeWithDate[]>();
        for (const entry of entries) {
            const year = entry.date.getFullYear();
            const yearEntries = years.get(year) ?? [];
            yearEntries.push(entry);
            years.set(year, yearEntries);
        }
        return orderBy(
            Array.from(years.entries()).map(([year, entries]) => ({
                type: "changelogYear",
                title: year.toString(),
                year,
                slug: [...parentSlug, year.toString()],
                icon: undefined,
                hidden: undefined,
                children: ChangelogNavigationConverter.groupByMonth(entries, [...parentSlug, year.toString()], year),
            })),
            "year",
            "desc",
        );
    }

    private static groupByMonth(
        entries: ChangelogEntryNodeWithDate[],
        parentSlug: string[],
        year: number,
    ): FernNavigation.ChangelogMonthNode[] {
        const months = new Map<number, ChangelogEntryNodeWithDate[]>();
        for (const entry of entries) {
            const month = entry.date.getMonth();
            const monthEntries = months.get(month) ?? [];
            monthEntries.push(entry);
            months.set(month, monthEntries);
        }
        return orderBy(
            Array.from(months.entries()).map(([month, entries]) => ({
                type: "changelogMonth",
                title: month.toString(),
                month,
                slug: [...parentSlug, month.toString()],
                icon: undefined,
                hidden: undefined,
                children: entries.map(toEntry),
            })),
            "month",
            "desc",
        );
    }

    private static convertChangelogEntry(
        item: DocsV1Read.ChangelogItem,
        parentSlug: string[],
    ): ChangelogEntryNodeWithDate {
        const date = parseISO(item.date);

        return {
            type: "changelogEntry",
            title: format(date, "MMMM d, yyyy"),
            date,
            pageId: FernNavigation.PageId(item.pageId),
            slug: [...parentSlug, `${date.getFullYear()}`, `${date.getMonth()}`, `${date.getDate()}`],
            icon: undefined,
            hidden: undefined,
        };
    }
}

function toEntry(node: ChangelogEntryNodeWithDate): FernNavigation.ChangelogEntryNode {
    return {
        type: "changelogEntry",
        title: node.title,
        date: node.date.toISOString(),
        pageId: node.pageId,
        slug: node.slug,
        icon: node.icon,
        hidden: node.hidden,
    };
}
