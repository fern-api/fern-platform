import { type EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString } from "@fern-api/ui-core-utils";

export function buildPath(path: EndpointDefinition["path"], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.value]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + part.value;
            }
            return part.value;
        })
        .join("");
}

export function indentAfter(str: string, indent: number, afterLine?: number): string {
    return str
        .split("\n")
        .map((line, idx) => {
            if (afterLine == null || idx > afterLine) {
                return " ".repeat(indent) + line;
            }
            return line;
        })
        .join("\n");
}
