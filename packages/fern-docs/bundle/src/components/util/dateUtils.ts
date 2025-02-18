import { formatRelative } from "date-fns";

/**
 * changelogs do not have a time component, so we can safely ignore user's timezones
 * parseZone() is used to format the date in the original timezone
 */
export class Changelog {
  // today, tomorrow, yesterday, last Thursday, 1/1/2020
  public static toCalendarDate(timestamp: string): string {
    return formatRelative(timestamp, new Date(), {
      // sameDay: "[today]",
      // nextDay: "[tomorrow]",
      // nextWeek: "dddd",
      // lastDay: "[yesterday]",
      // lastWeek: "[last] dddd",
      // sameElse: "M/D/YYYY", // TODO: this is not localized and should be fixed
    });
  }
}
