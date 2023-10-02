import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import classNames from "classnames";
import { zip } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { AutoSizer, Grid, GridCellProps, Index } from "react-virtualized";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { flattenJsonToLines, getJsonLineLength, JsonLine, renderJsonLine } from "./jsonLineUtils";

const LINE_HEIGHT = 21.5;
const CHAR_WIDTH = 7.2;
const HORIZONTAL_PADDING = 16;
const VERTICAL_PADDING = 20;

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
    const jsonLines = useMemo(() => flattenJsonToLines(json), [useDeepCompareMemoize(json)]);
    const maxCharLength = Math.max(...jsonLines.map((line) => getJsonLineLength(line)));
    const maxColumnWidth = maxCharLength * CHAR_WIDTH + HORIZONTAL_PADDING * 2;
    const contentHeight = jsonLines.length * LINE_HEIGHT + VERTICAL_PADDING * 2;
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
