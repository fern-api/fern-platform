import { isPlainObject } from "@fern-ui/core-utils";
import { query as jpquery } from "jsonpath";
import { captureSentryError } from "../../analytics/sentry";
import { JsonPropertyPath, JsonPropertyPathPart } from "./JsonPropertyPath";
import { lineNumberOf } from "./utils";

export function getJsonLineNumbers(json: unknown, path: JsonPropertyPath, start = 0): (number | [number, number])[] {
    const jsonString = JSON.stringify(json, undefined, 2);
    const part = path[0];
    if (part == null) {
        const length = jsonString.split("\n").length;
        return length === 0 ? [] : length === 1 ? [start] : [[start, start + length - 1]];
    }

    const query = "$" + getQueryPart(part);

    let results: unknown[] = [];

    try {
        results = jpquery(json, query);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        captureSentryError(e, {
            context: "ApiPage",
            errorSource: "getJsonLineNumbers",
            errorDescription:
                "Jsonpath failed to query JSON object. Check the query that was constructed when the user hovered over a specific property",
            data: { json, query },
        });
    }

    if (part.type === "objectFilter") {
        if (isPlainObject(json) && json[part.propertyName] === part.requiredValue) {
            return getJsonLineNumbers(json, path.slice(1), start);
        }
    }

    return results.flatMap((result) => {
        // get start of string by matching
        const toMatch = jsonStringifyAndIndent(
            result,
            part.type === "objectProperty" ? part.propertyName : undefined,
            1,
        );
        const startLine = lineNumberOf(jsonString, toMatch);
        if (startLine === -1) {
            return [];
        }

        return getJsonLineNumbers(result, path.slice(1), startLine).map((line) =>
            typeof line === "number" ? start + line : [start + line[0], start + line[1]],
        );
    });
}

function jsonStringifyAndIndent(json: unknown, key: string | undefined, depth: number) {
    let jsonString = JSON.stringify(json, undefined, 2);
    if (key != null) {
        jsonString = `"${key}": ${jsonString}`;
    }
    return jsonString
        .split("\n")
        .map((line, idx) => (idx === 0 ? line : "  ".repeat(depth) + line))
        .join("\n");
}

function getQueryPart(path: JsonPropertyPathPart) {
    switch (path.type) {
        case "objectProperty":
            return path.propertyName != null ? `['${path.propertyName}']` : "[*]";
        case "listItem":
            return "[*]";
        case "objectFilter":
            return `[?(@.${path.propertyName}=='${path.requiredValue}')]`;
    }
}
