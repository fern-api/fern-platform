import { startCase } from "lodash-es";
import title from "title";
import { SPECIAL_TOKENS } from "./specialTokens";

export function titleCase(name: string): string {
    const titleCased = title(startCase(name), { special: SPECIAL_TOKENS });

    // regex match "V 2", "V 4", etc. and replace it with "V2", "V4", etc.
    const versionedTitle = titleCased.replace(/V\s(\d)/g, "V$1");
    return versionedTitle;
}
