import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { AutoSizer, Grid, GridCellProps, Index } from "react-virtualized";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { flattenJsonToLines, getIsSelectedArr, getJsonLineLength, renderJsonLine } from "./jsonLineUtils";

const LINE_HEIGHT = 21.5;
const CHAR_WIDTH = 7.2;
const HORIZONTAL_PADDING = 16;
const VERTICAL_PADDING = 20;

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
        selectedProperty: JsonPropertyPath | undefined;
        parent: HTMLElement | undefined;
    }
}

export const JsonExample = React.memo<JsonExample.Props>(function JsonExample({ json, parent, selectedProperty }) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const jsonLines = useMemo(() => flattenJsonToLines(json), [useDeepCompareMemoize(json)]);

    const isSelectedArr = useMemo(() => getIsSelectedArr(jsonLines, selectedProperty), [jsonLines, selectedProperty]);

    const topLineAnchorIdx = isSelectedArr.findIndex((isSelected) => isSelected);

    useEffect(() => {
        if (topLineAnchorIdx > -1) {
            parent?.scrollTo({
                top: topLineAnchorIdx * LINE_HEIGHT - VERTICAL_PADDING,
                left: 0,
                behavior: "smooth",
            });
        }
    }, [parent, topLineAnchorIdx]);

    return (
        <>
            {jsonLines.map((line, i) => {
                const isSelected = isSelectedArr[i] ?? false;
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

export declare namespace JsonExampleVirtualized {
    export interface Props {
        json: unknown;
        selectedProperty: JsonPropertyPath | undefined;
        maxContentHeight: number;
    }
}

export const JsonExampleVirtualized = React.memo<JsonExampleVirtualized.Props>(function JsonExample({
    json,
    selectedProperty,
    maxContentHeight,
}) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const jsonLines = useMemo(() => flattenJsonToLines(json), [useDeepCompareMemoize(json)]);
    const maxCharLength = Math.max(...jsonLines.map((line) => getJsonLineLength(line)));
    const maxColumnWidth = maxCharLength * CHAR_WIDTH + HORIZONTAL_PADDING * 2;
    const contentHeight = jsonLines.length * LINE_HEIGHT + VERTICAL_PADDING * 2;
    const isSelectedArr = useMemo(() => getIsSelectedArr(jsonLines, selectedProperty), [jsonLines, selectedProperty]);

    const topLineAnchorIdx = isSelectedArr.findIndex((isSelected) => isSelected);

    const listRef = useRef<Grid>(null);

    useEffect(() => {
        if (topLineAnchorIdx > -1) {
            listRef.current?.scrollToPosition({
                scrollLeft: 0,
                scrollTop: topLineAnchorIdx * LINE_HEIGHT - VERTICAL_PADDING,
            });
        }
    }, [topLineAnchorIdx]);

    const getRowHeight = useCallback(
        ({ index }: Index) => {
            return index === 0 || index === jsonLines.length + 1 ? VERTICAL_PADDING : LINE_HEIGHT;
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
