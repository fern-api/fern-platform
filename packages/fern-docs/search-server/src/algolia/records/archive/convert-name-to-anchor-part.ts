import { camelCase, upperFirst } from "es-toolkit/string";

export function convertNameToAnchorPart(
    name: string | null | undefined
): string | undefined {
    if (name == null) {
        return undefined;
    }
    return upperFirst(camelCase(name));
}
