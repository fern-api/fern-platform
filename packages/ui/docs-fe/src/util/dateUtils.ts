import moment from "moment";

/**
 * changelogs do not have a time component, so we can safely ignore user's timezones
 * parseZone() is used to format the date in the original timezone
 */
export class Changelog {
    // Jan 01 2020
    public static toShortDateString(timestamp: string): string {
        return startOfDate(timestamp).format("MMM DD YYYY");
    }

    // January 1, 2020
    public static toLongDateString(timestamp: string): string {
        return startOfDate(timestamp).format("MMMM D, YYYY");
    }

    // today, tomorrow, yesterday, last Thursday, 1/1/2020
    public static toCalendarDate(timestamp: string): string {
        return startOfDate(timestamp).calendar({
            sameDay: "[today]",
            nextDay: "[tomorrow]",
            nextWeek: "dddd",
            lastDay: "[yesterday]",
            lastWeek: "[last] dddd",
            sameElse: "M/D/YYYY", // TODO: this is not localized and should be fixed
        });
    }

    public static withinLastWeek(timestamp: string): boolean {
        const now = startOfDate();
        const other = startOfDate(timestamp);
        if (other.isAfter(now)) {
            return false;
        }

        return other.isSameOrAfter(now.subtract(7, "days"));
    }

    public static isFutureDate(timestamp: string): boolean {
        const now = startOfDate();
        const other = startOfDate(timestamp);
        return other.isAfter(now);
    }
}

function startOfDate(timestamp?: string): moment.Moment {
    return moment(timestamp).parseZone().startOf("day");
}
