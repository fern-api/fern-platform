import { printTable } from "console-table-printer";
import * as emoji from "node-emoji";
import { RuleResult } from "./rules/runRules";

export function printResults(
    results: { url: string; results: RuleResult[] }[]
): void {
    const items = results.map((r) => {
        const row: Record<string, unknown> = {
            Url: r.url,
        };
        for (const res of r.results) {
            row[res.name] = res.success
                ? emoji.emojify(":white_check_mark:")
                : emoji.emojify(":x:");
        }
        return row;
    });
    printTable(items);
}
