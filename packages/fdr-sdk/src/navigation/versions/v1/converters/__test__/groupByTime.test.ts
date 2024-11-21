import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { FernNavigation } from "../../../../..";
import { groupByMonth, groupByYear } from "../ChangelogConverter";

dayjs.extend(utc);

describe("Grouping Functions", () => {
    const entries: FernNavigation.V1.ChangelogEntryNode[] = [
        {
            id: FernNavigation.V1.NodeId("entry-1"),
            pageId: FernNavigation.PageId("entry-1"),
            type: "changelogEntry",
            date: "2024-11-01",
            title: "Entry 1",
            slug: FernNavigation.V1.Slug("entry-1"),
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            noindex: undefined,
        },
        {
            id: FernNavigation.V1.NodeId("entry-2"),
            pageId: FernNavigation.PageId("entry-2"),
            type: "changelogEntry",
            date: "2024-11-15",
            title: "Entry 2",
            slug: FernNavigation.V1.Slug("entry-2"),
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            noindex: undefined,
        },
        {
            id: FernNavigation.V1.NodeId("entry-3"),
            pageId: FernNavigation.PageId("entry-3"),
            type: "changelogEntry",
            date: "2024-10-20",
            title: "Entry 3",
            slug: FernNavigation.V1.Slug("entry-3"),
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            noindex: undefined,
        },
        {
            id: FernNavigation.V1.NodeId("entry-4"),
            pageId: FernNavigation.PageId("entry-4"),
            type: "changelogEntry",
            date: "2023-12-01",
            title: "Entry 4",
            slug: FernNavigation.V1.Slug("entry-4"),
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            noindex: undefined,
        },
    ];

    describe("groupByYear", () => {
        it("should group entries by year", () => {
            const result = groupByYear(entries);

            expect(result.size).toBe(2);
            expect(result.get(2024)).toEqual(entries.slice(0, 3));
            expect(result.get(2023)).toEqual([entries[3]]);
        });

        it("should return an empty map for empty input", () => {
            const result = groupByYear([]);
            expect(result.size).toBe(0);
        });
    });

    describe("groupByMonth", () => {
        it("should group entries by month and include the year", () => {
            const result = groupByMonth(entries);

            expect(result.size).toBe(3);

            expect(result.get(11)).toEqual([2024, entries.slice(0, 2)]);

            expect(result.get(10)).toEqual([2024, [entries[2]]]);

            expect(result.get(12)).toEqual([2023, [entries[3]]]);
        });

        it("should return an empty map for empty input", () => {
            const result = groupByMonth([]);
            expect(result.size).toBe(0);
        });
    });
});
