import { tz } from "@date-fns/tz";
import { format as formatFn } from "date-fns";

const utc = tz("UTC");

export function formatUtc(...args: Parameters<typeof formatFn>): string {
    return formatFn(utc(args[0]), args[1], args[2]);
}
