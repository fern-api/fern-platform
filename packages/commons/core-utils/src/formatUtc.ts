import { formatInTimeZone } from "date-fns-tz";

export function formatUtc(
    date: Date | number | string,
    format: string
): string {
    return formatInTimeZone(date, "UTC", format);
}
