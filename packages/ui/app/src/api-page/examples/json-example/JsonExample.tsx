import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import classNames from "classnames";
import { zip } from "lodash-es";
import React, { ReactNode, useMemo } from "react";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
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
type JsonLine =
    | JsonLineNumber
    | JsonLineString
    | JsonLineBoolean
    | JsonLineNull
    | JsonLineObject
    | JsonLineList
    | JsonLineObjectEnd
    | JsonLineListEnd;

function flattenJson(
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
                    flattenJson(v, key, depth + 1, i === entries.length - 1, [...path, key])
                ),
                { depth, type: "objectEnd", comma: !isLast, path },
            ];
        },
        list: (list): JsonLine[] => [
            { depth, type: "list", key, path },
            ...list.flatMap((item, i) =>
                flattenJson(item, undefined, depth + 1, i === list.length - 1, [...path, `${i}`])
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

function renderJsonLine(line: JsonLine): ReactNode {
    switch (line.type) {
        case "boolean":
            return (
                <>
                    {" ".repeat(TAB_WIDTH * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    {line.value}
                    {line.comma ? "," : undefined}
                </>
            );
        case "list":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    {"["}
                </>
            );
        case "listEnd":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {"]"}
                    {line.comma ? "," : undefined}
                </>
            );
        case "null":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    <span className="italic">null</span>
                    {line.comma ? "," : undefined}
                </>
            );
        case "number":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    {line.value}
                    {line.comma ? "," : undefined}
                </>
            );
        case "object":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    {"{"}
                </>
            );
        case "objectEnd":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {"}"}
                    {line.comma ? "," : undefined}
                </>
            );
        case "string":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? `"${line.key}": ` : undefined}
                    {`"${line.value}"`}
                    {line.comma ? "," : undefined}
                </>
            );
    }
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

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
        selectedProperty: JsonPropertyPath | undefined;
        parent: HTMLElement | undefined;
    }
}

export const JsonExample = React.memo<JsonExample.Props>(function JsonExample({ json, selectedProperty }) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const jsonLines = useMemo(() => flattenJson(json), [useDeepCompareMemoize(json)]);
    const selectedPropertyHash = selectedProperty?.map((path) => {
        if (path.type === "listItem") {
            return `${path.index ?? "*"}`;
        } else if (path.type === "objectProperty") {
            return path.propertyName ?? "*";
        } else {
            return path.propertyName;
        }
    });

    return (
        <>
            {jsonLines.map((line, i) => {
                const isSelected = checkIsSelected(selectedPropertyHash, line);
                return (
                    <div
                        className={classNames(
                            "relative w-fit min-w-full px-4 transition py-px",
                            isSelected ? "bg-accent-primary/20" : "bg-transparent"
                        )}
                        key={i}
                    >
                        {isSelected && <div className="bg-accent-primary absolute inset-y-0 left-0 w-1" />}
                        {renderJsonLine(line)}
                    </div>
                );
            })}
        </>
    );
});
