import { ResolvedEndpointPathParts } from "../../../resolver/types";
import { unknownToString } from "../../utils";

export function buildPath(path: ResolvedEndpointPathParts[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.key]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + part.key;
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
