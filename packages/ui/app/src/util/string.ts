import { capitalize, snakeCase } from "lodash-es";

export function toTitleCase(str: string): string {
    return snakeCase(str).split("_").map(capitalize).join(" ");
}
