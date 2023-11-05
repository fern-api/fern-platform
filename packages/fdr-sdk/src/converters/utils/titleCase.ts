import { capitalize, snakeCase } from "lodash";

export function titleCase(str: string): string {
    return snakeCase(str).split("_").map(capitalize).join(" ");
}
