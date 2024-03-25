import lodash from "lodash";

const { capitalize, snakeCase } = lodash;

export function titleCase(str: string): string {
    return snakeCase(str).split("_").map(capitalize).join(" ");
}
