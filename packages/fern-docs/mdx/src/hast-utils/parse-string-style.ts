import { camelCase } from "es-toolkit/string";
import StyleToObject from "style-to-object";

export function parseStringStyle(
    value: unknown
): Record<string, string> | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const result: Record<string, string> = {};

    try {
        StyleToObject(value, replacer);
    } catch (e) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Failed to parse style originating from shiki", e);
        return undefined;
    }

    function replacer(name: string, value: string) {
        let key = name;

        if (key.slice(0, 2) !== "--") {
            if (key.slice(0, 4) === "-ms-") {
                key = "ms-" + key.slice(4);
            }
            key = camelCase(key);
        }

        result[key] = value;
    }

    return result;
}
