import { ReactNode } from "react";
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
interface JsonLineObject {
    path: string[];
    depth: number;
    type: "object";
    key?: string;
}
interface JsonLineList {
    path: string[];
    depth: number;
    type: "list";
    key?: string;
}
interface JsonLineObjectEnd {
    path: string[];
    depth: number;
    type: "objectEnd";
    comma: boolean;
}
interface JsonLineListEnd {
    path: string[];
    depth: number;
    type: "listEnd";
    comma: boolean;
}
export type JsonLine =
    | JsonLineObject
    | JsonLineObjectEnd
    | JsonLineList
    | JsonLineListEnd
    | JsonLineString
    | JsonLineNumber
    | JsonLineBoolean
    | JsonLineNull;

export interface JsonLineVisitor<T> {
    object: (line: JsonLineObject) => T;
    objectEnd: (line: JsonLineObjectEnd) => T;
    list: (line: JsonLineList) => T;
    listEnd: (line: JsonLineListEnd) => T;
    string: (line: JsonLineString) => T;
    number: (line: JsonLineNumber) => T;
    boolean: (line: JsonLineBoolean) => T;
    null: (line: JsonLineNull) => T;
}

export function visitJsonLine<T>(value: JsonLine, visitor: JsonLineVisitor<T>): T {
    switch (value.type) {
        case "object":
            return visitor.object(value);
        case "objectEnd":
            return visitor.objectEnd(value);
        case "list":
            return visitor.list(value);
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
    }
}

export function flattenJsonToLines(
    json: unknown,
    key?: string,
    depth: number = 0,
    isLast: boolean = true,
    path: string[] = key != null ? [key] : []
): JsonLine[] {
    return visitJsonItem(json, {
        object: (o): JsonLine[] => {
            const entries = Object.entries(o);
            return [
                { depth, type: "object", key, path },
                ...entries.flatMap(([key, v], i) =>
                    flattenJsonToLines(v, key, depth + 1, i === entries.length - 1, [...path, key])
                ),
                { depth, type: "objectEnd", comma: !isLast, path },
            ];
        },
        list: (list): JsonLine[] => [
            { depth, type: "list", key, path },
            ...list.flatMap((item, i) =>
                flattenJsonToLines(item, undefined, depth + 1, i === list.length - 1, [...path, `${i}`])
            ),
            { depth, type: "listEnd", comma: !isLast, path },
        ],
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

export function renderJsonLine(line: JsonLine, tabWidth = TAB_WIDTH): ReactNode {
    return visitJsonLine(line, {
        object: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <span className="text-text-primary-light dark:text-text-primary-dark">{"{"}</span>
            </>
        ),
        objectEnd: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                <span className="text-text-primary-light dark:text-text-primary-dark">{"}"}</span>
                {line.comma ? renderComma() : null}
            </>
        ),
        list: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <span className="text-text-primary-light dark:text-text-primary-dark">{"["}</span>
            </>
        ),
        listEnd: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                <span className="text-text-primary-light dark:text-text-primary-dark">{"]"}</span>
                {line.comma ? renderComma() : null}
            </>
        ),
        string: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <JsonExampleString value={line.value} />
                {line.comma ? renderComma() : null}
            </>
        ),
        number: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <span className="text-[#d67653]">{line.value}</span>
                {line.comma ? renderComma() : null}
            </>
        ),
        boolean: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <span className="font-medium text-[#738ee8]">{line.value.toString()}</span>
                {line.comma ? renderComma() : null}
            </>
        ),
        null: (line) => (
            <>
                {" ".repeat(tabWidth * line.depth)}
                {renderKey(line.key)}
                <span className="italic">null</span>
                {line.comma ? renderComma() : null}
            </>
        ),
    });
}

export function getJsonLineLength(line: JsonLine, tabWidth = TAB_WIDTH): number {
    return visitJsonLine(line, {
        object: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1,
        objectEnd: (line) => tabWidth * line.depth + 1 + (line.comma ? 1 : 0),
        list: (line) => tabWidth * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1,
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
