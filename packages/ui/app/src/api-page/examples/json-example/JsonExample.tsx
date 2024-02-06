import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo } from "react";
import { VirtualizedExample } from "../VirtualizedExample";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { flattenJsonToLines, getIsSelectedArr, JsonLine, renderJsonLine } from "./jsonLineUtils";

const LINE_HEIGHT = 21.5;
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
    const jsonLines = useMemo<JsonLine[]>(() => flattenJsonToLines(json), [useDeepCompareMemoize(json)]);

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
                            isSelected ? "bg-accent-highlight" : "bg-transparent",
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
        jsonLines: JsonLine[];
        selectedProperty: JsonPropertyPath | undefined;
        height: number;
    }
}

export const JsonExampleVirtualized: React.FC<JsonExampleVirtualized.Props> = ({
    jsonLines,
    selectedProperty,
    height,
}) => {
    const isSelectedArr = useMemo(() => getIsSelectedArr(jsonLines, selectedProperty), [jsonLines, selectedProperty]);
    const topLineAnchorIdx = isSelectedArr.findIndex((isSelected) => isSelected);

    const renderRow = useCallback(
        (i: number, row: JsonLine) => {
            const isSelected = isSelectedArr[i] ?? false;
            return (
                <div
                    className={classNames(
                        "relative w-fit h-full min-w-full px-4 transition py-px",
                        isSelected ? "bg-accent-highlight" : "bg-transparent",
                    )}
                >
                    {isSelected && <div className="bg-accent-primary absolute inset-y-0 left-0 w-1" />}
                    {renderJsonLine(row)}
                </div>
            );
        },
        [isSelectedArr],
    );

    return (
        <VirtualizedExample<JsonLine>
            data={jsonLines}
            itemContent={renderRow}
            height={height}
            scrollToRow={topLineAnchorIdx > -1 ? topLineAnchorIdx : undefined}
        />
    );
};
