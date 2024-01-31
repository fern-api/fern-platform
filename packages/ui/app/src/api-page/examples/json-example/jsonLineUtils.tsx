import { assertNever } from "@fern-ui/core-utils";
import { zip } from "lodash-es";
import { ReactNode } from "react";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { JsonExampleString } from "./JsonExampleString";
import { visitJsonItem } from "./visitJsonItem";

interface JsonLineNumber {
    path: string[];
    depth: number;
    type: "number";
    key?: string;
    value: number;
    comma: boolean;
}
interface JsonLineString {
    path: string[];
    depth: number;
    type: "string";
    key?: string;
    value: string;
    comma: boolean;
}
interface JsonLineBoolean {
    path: string[];
    depth: number;
    type: "boolean";
    key?: string;
    value: boolean;
    comma: boolean;
}
interface JsonLineNull {
    path: string[];
    depth: number;
    type: "null";
    key?: string;
    comma: boolean;
}
interface JsonLineObjectEmpty {
    path: string[];
    depth: number;
    type: "objectEmpty";
    key?: string;
    comma: boolean;
}
interface JsonLineObjectStart {
    path: string[];
    depth: number;
    type: "objectStart";
    key?: string;
}
interface JsonLineObjectEnd {
    path: string[];
    depth: number;
    type: "objectEnd";
    comma: boolean;
}
interface JsonLineListEmpty {
    path: string[];
    depth: number;
    type: "listEmpty";
    key?: string;
    comma: boolean;
}
interface JsonLineListStart {
    path: string[];
    depth: number;
    type: "listStart";
    key?: string;
}
interface JsonLineListEnd {
    path: string[];
    depth: number;
    type: "listEnd";
    comma: boolean;
}
export type JsonLine =
    | JsonLineObjectEmpty
    | JsonLineObjectStart
    | JsonLineObjectEnd
    | JsonLineListEmpty
    | JsonLineListStart
    | JsonLineListEnd
    | JsonLineString
    | JsonLineNumber
    | JsonLineBoolean
    | JsonLineNull;

export interface JsonLineVisitor<T> {
    objectEmpty: (line: JsonLineObjectEmpty) => T;
    objectStart: (line: JsonLineObjectStart) => T;
    objectEnd: (line: JsonLineObjectEnd) => T;
    listEmpty: (line: JsonLineListEmpty) => T;
    listStart: (line: JsonLineListStart) => T;
    listEnd: (line: JsonLineListEnd) => T;
    string: (line: JsonLineString) => T;
    number: (line: JsonLineNumber) => T;
    boolean: (line: JsonLineBoolean) => T;
    null: (line: JsonLineNull) => T;
}

export function visitJsonLine<T>(value: JsonLine, visitor: JsonLineVisitor<T>): T {
    switch (value.type) {
        case "objectEmpty":
            return visitor.objectEmpty(value);
        case "objectStart":
            return visitor.objectStart(value);
        case "objectEnd":
            return visitor.objectEnd(value);
        case "listEmpty":
            return visitor.listEmpty(value);
        case "listStart":
            return visitor.listStart(value);
        case "listEnd":
            return visitor.listEnd(value);
        case "string":
            return visitor.string(value);
        case "number":
            return visitor.number(value);
        case "boolean":
            return visitor.boolean(value);
        case "null":
            return visitor.null(value);
        default:
            assertNever(value);
    }
}

export function flattenJsonToLines(
    json: unknown,
    key?: string,
    depth: number = 0,
    isLast: boolean = true,
    path: string[] = key != null ? [key] : [],
): JsonLine[] {
    return visitJsonItem(json, {
        object: (o): JsonLine[] => {
            const entries = Object.entries(o);
            if (entries.length === 0) {
                return [{ depth, type: "objectEmpty", comma: !isLast, key, path }];
            }
            return [
                { depth, type: "objectStart", key, path },
                ...entries.flatMap(([key, v], i) =>
                    flattenJsonToLines(v, key, depth + 1, i === entries.length - 1, [...path, key]),
                ),
                { depth, type: "objectEnd", comma: !isLast, path },
            ];
        },
        list: (list): JsonLine[] => {
            if (list.length === 0) {
                return [{ depth, type: "listEmpty", comma: !isLast, key, path }];
            }
            return [
                { depth, type: "listStart", key, path },
                ...list.flatMap((item, i) =>
                    flattenJsonToLines(item, undefined, depth + 1, i === list.length - 1, [...path, `${i}`]),
                ),
                { depth, type: "listEnd", comma: !isLast, path },
            ];
        },
        string: (value): JsonLine[] => [{ depth, type: "string", key, value, comma: !isLast, path }],
        number: (value): JsonLine[] => [{ depth, type: "number", key, value, comma: !isLast, path }],
        boolean: (value): JsonLine[] => [{ depth, type: "boolean", key, value, comma: !isLast, path }],
        null: (): JsonLine[] => [{ depth, type: "null", key, comma: !isLast, path }],
    });
}

const TAB_WIDTH = 2;

function renderKey(key: string | undefined) {
    if (key != null) {
        return (
            <span className="text-text-primary-light dark:text-text-primary-dark">
                &quot;{key}&quot;{": "}
            </span>
        );
    }
    return null;
}

function renderComma() {
    return <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>;
}

export function renderJsonLineValue(line: JsonLine): ReactNode {
    return visitJsonLine(line, {
        objectEmpty: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"{}"}</span>,
        objectStart: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"{"}</span>,
        objectEnd: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"}"}</span>,
        listEmpty: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"[]"}</span>,
        listStart: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"["}</span>,
        listEnd: () => <span className="text-text-primary-light dark:text-text-primary-dark">{"]"}</span>,
        string: (line) => <JsonExampleString value={line.value} newLineColOffset={line.depth * TAB_WIDTH} />,
        number: (line) => <span className="text-[#d67653]">{line.value}</span>,
        boolean: (line) => <span className="font-medium text-[#738ee8]">{line.value.toString()}</span>,
        null: () => <span className="italic">null</span>,
    });
}

export function jsonLineValueToString(line: JsonLine): string {
    return visitJsonLine(line, {
        objectEmpty: () => "{}",
        objectStart: () => "{",
        objectEnd: () => "}",
        listEmpty: () => "[]",
        listStart: () => "[",
        listEnd: () => "]",
        string: (line) => JSON.stringify(line.value),
        number: (line) => `${line.value}`,
        boolean: (line) => line.value.toString(),
        null: () => "null",
    });
}

export function renderJsonLine(line: JsonLine, tabWidth = TAB_WIDTH): ReactNode {
    return visitJsonLine(line, {
        objectEmpty: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        objectStart: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
            </>
        ),
        objectEnd: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        listEmpty: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        listStart: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
            </>
        ),
        listEnd: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        string: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        number: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        boolean: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
        null: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                {renderJsonLineValue(line)}
                {line.comma ? renderComma() : null}
            </>
        ),
    });
}

export function jsonLineToString(line: JsonLine, tabWidth = TAB_WIDTH): string {
    return visitJsonLine(line, {
        objectEmpty: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}`,
        objectStart: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}`,
        objectEnd: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${jsonLineValueToString(line)}${line.comma ? "," : ""}`,
        listEmpty: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}`,
        listStart: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}`,
        listEnd: (line) => `${" ".repeat(tabWidth * line.depth)}${jsonLineValueToString(line)}${line.comma ? "," : ""}`,
        string: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}${line.comma ? "," : ""}`,
        number: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}${line.comma ? "," : ""}`,
        boolean: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}${line.comma ? "," : ""}`,
        null: (line) =>
            `${" ".repeat(tabWidth * line.depth)}${line.key != null ? `"${line.key}": ` : ""}${jsonLineValueToString(
                line,
            )}${line.comma ? "," : ""}`,
    });
}

export function getJsonLineLength(line: JsonLine, tabWidth = TAB_WIDTH): number {
    return visitJsonLine(line, {
        objectEmpty: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 2,
        objectStart: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1,
        objectEnd: (line) => tabWidth * line.depth + 1 + (line.comma ? 1 : 0),
        listEmpty: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 2,
        listStart: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1,
        listEnd: (line) => tabWidth * line.depth + 1 + (line.comma ? 1 : 0),
        string: (line) =>
            tabWidth * line.depth +
            (line.key != null ? line.key.length + 4 : 0) +
            line.value.length +
            2 +
            (line.comma ? 1 : 0),
        number: (line) =>
            tabWidth * line.depth +
            (line.key != null ? line.key.length + 4 : 0) +
            line.value.toString().length +
            (line.comma ? 1 : 0),
        boolean: (line) =>
            tabWidth * line.depth +
            (line.key != null ? line.key.length + 4 : 0) +
            line.value.toString().length +
            (line.comma ? 1 : 0),
        null: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 4 + (line.comma ? 1 : 0),
    });
}

function checkIsSelected(selectedPropertyHash: string[] | undefined, line: JsonLine): boolean {
    if (selectedPropertyHash == null) {
        return false;
    }
    if (selectedPropertyHash.length === 0) {
        return true;
    }
    if (selectedPropertyHash.length > line.path.length) {
        return false;
    }
    const pathToMatch = line.path.slice(0, selectedPropertyHash.length);
    return zip(selectedPropertyHash, pathToMatch).every(([left, right]) => left === "*" || left === right);
}

function getSelectedPropertyHash(selectedProperty: JsonPropertyPath | undefined) {
    return selectedProperty?.map((path) => {
        if (path.type === "listItem") {
            return `${path.index ?? "*"}`;
        } else if (path.type === "objectProperty") {
            return path.propertyName ?? "*";
        } else {
            return path.propertyName;
        }
    });
}

export function getIsSelectedArr(jsonLines: JsonLine[], selectedProperty: JsonPropertyPath | undefined): boolean[] {
    const selectedPropertyHash = getSelectedPropertyHash(selectedProperty);
    return jsonLines.map((line) => checkIsSelected(selectedPropertyHash, line));
}
