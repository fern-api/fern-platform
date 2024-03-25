import lodash from "lodash";
// eslint-disable-next-line jest/unbound-method
const { capitalize, snakeCase } = lodash;

export function titleCase(str: string): string {
    return snakeCase(str).split("_").map(capitalize).join(" ");
}
