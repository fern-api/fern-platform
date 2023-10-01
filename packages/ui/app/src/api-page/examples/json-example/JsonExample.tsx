import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import classNames from "classnames";
import { zip } from "lodash-es";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { AutoSizer, Grid, GridCellProps, Index } from "react-virtualized";
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
const LINE_HEIGHT = 21.5;
const CHAR_WIDTH = 7.2;

function renderJsonLine(line: JsonLine): ReactNode {
    switch (line.type) {
        case "boolean":
            return (
                <>
                    {" ".repeat(TAB_WIDTH * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <span className="font-medium text-[#738ee8]">{line.value.toString()}</span>
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
        case "list":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <span className="text-text-primary-light dark:text-text-primary-dark">{"["}</span>
                </>
            );
        case "listEnd":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    <span className="text-text-primary-light dark:text-text-primary-dark">{"]"}</span>
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
        case "null":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <span className="italic">null</span>
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
        case "number":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <span className="text-[#d67653]">{line.value}</span>
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
        case "object":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <span className="text-text-primary-light dark:text-text-primary-dark">{"{"}</span>
                </>
            );
        case "objectEnd":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    <span className="text-text-primary-light dark:text-text-primary-dark">{"}"}</span>
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
        case "string":
            return (
                <>
                    {" ".repeat(2 * line.depth)}
                    {line.key != null ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                            &quot;{line.key}&quot;{": "}
                        </span>
                    ) : undefined}
                    <JsonExampleString value={line.value} />
                    {line.comma ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{","}</span>
                    ) : undefined}
                </>
            );
    }
}

function getJsonLineLength(line: JsonLine): number {
    switch (line.type) {
        case "boolean":
            return (
                2 * line.depth +
                (line.key != null ? line.key.length + 4 : 0) +
                line.value.toString().length +
                (line.comma ? 1 : 0)
            );
        case "list":
            return 2 * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1;
        case "listEnd":
            return 2 * line.depth + 1 + (line.comma ? 1 : 0);
        case "null":
            return 2 * line.depth + (line.key != null ? line.key.length + 4 : 0) + 4 + (line.comma ? 1 : 0);
        case "number":
            return (
                2 * line.depth +
                (line.key != null ? line.key.length + 4 : 0) +
                line.value.toString().length +
                (line.comma ? 1 : 0)
            );
        case "object":
            return 2 * line.depth + (line.key != null ? line.key.length + 4 : 0) + 1;
        case "objectEnd":
            return 2 * line.depth + 1 + (line.comma ? 1 : 0);
        case "string":
            return (
                2 * line.depth +
                (line.key != null ? line.key.length + 4 : 0) +
                line.value.length +
                2 +
                (line.comma ? 1 : 0)
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
        maxContentHeight: number;
    }
}

export const JsonExample = React.memo<JsonExample.Props>(function JsonExample({
    json,
    selectedProperty,
    maxContentHeight,
}) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const jsonLines = useMemo(() => flattenJson(json), [useDeepCompareMemoize(json)]);
    const maxCharLength = Math.max(...jsonLines.map((line) => getJsonLineLength(line)));
    const maxColumnWidth = maxCharLength * CHAR_WIDTH + 16 * 2;
    const contentHeight = jsonLines.length * LINE_HEIGHT + 40;
    const selectedPropertyHash = useDeepCompareMemoize(
        selectedProperty?.map((path) => {
            if (path.type === "listItem") {
                return `${path.index ?? "*"}`;
            } else if (path.type === "objectProperty") {
                return path.propertyName ?? "*";
            } else {
                return path.propertyName;
            }
        })
    );

    const isSelectedArr = useMemo(
        () => jsonLines.map((line) => checkIsSelected(selectedPropertyHash, line)),
        [jsonLines, selectedPropertyHash]
    );

    const topLineAnchorIdx = isSelectedArr.findIndex((isSelected) => isSelected);

    const listRef = useRef<Grid>(null);

    useEffect(() => {
        if (topLineAnchorIdx > -1) {
            listRef.current?.scrollToPosition({
                scrollLeft: 0,
                scrollTop: topLineAnchorIdx * LINE_HEIGHT - 20,
            });
        }
    }, [topLineAnchorIdx]);

    const getRowHeight = useCallback(
        ({ index }: Index) => {
            return index === 0 || index === jsonLines.length + 1 ? 20 : LINE_HEIGHT;
        },
        [jsonLines.length]
    );

    const renderCell = useCallback(
        ({ style, key, rowIndex }: GridCellProps) => {
            if (rowIndex === 0 || rowIndex === jsonLines.length + 1) {
                // vertical padding
                return <div style={style} key={key} />;
            }
            const line = jsonLines[rowIndex - 1];
            const isSelected = isSelectedArr[rowIndex] ?? false;
            if (line == null) {
                return <div style={style} key={key} />;
            }
            return (
                <div style={style} key={key}>
                    <div
                        className={classNames(
                            "relative w-fit min-w-full px-4 transition py-px",
                            isSelected ? "bg-accent-primary/20" : "bg-transparent"
                        )}
                        style={{
                            lineHeight: `${LINE_HEIGHT}px`,
                        }}
                    >
                        {isSelected && <div className="bg-accent-primary absolute inset-y-0 left-0 w-1" />}
                        {renderJsonLine(line)}
                    </div>
                </div>
            );
        },
        [isSelectedArr, jsonLines]
    );

    return (
        <AutoSizer disableHeight={true}>
            {({ width }) => (
                <Grid
                    ref={listRef}
                    height={contentHeight > maxContentHeight ? maxContentHeight : contentHeight}
                    rowHeight={getRowHeight}
                    columnWidth={maxColumnWidth}
                    rowCount={jsonLines.length + 2}
                    columnCount={1}
                    width={width}
                    cellRenderer={renderCell}
                />
            )}
        </AutoSizer>
    );
});
