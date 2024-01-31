import { assertNever } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { useMemo } from "react";
import { JsonPropertyPath } from "../json-example/contexts/JsonPropertyPath";
import { getIsSelectedArr, renderJsonLine } from "../json-example/jsonLineUtils";
import { VirtualizedExample } from "../VirtualizedExample";
import { CurlParameter } from "./CurlParameter";
import { CurlLine, CurlLineJson } from "./curlUtils";

export declare namespace CurlExample {
    export interface Props {
        curlLines: CurlLine[];
        selectedProperty: JsonPropertyPath | undefined;
        height: number;
    }
}

const CURL_PREFIX = "curl ";

export const CurlExample: React.FC<CurlExample.Props> = ({ curlLines, selectedProperty, height }) => {
    const firstJsonLine = curlLines.findIndex((part) => part.type === "json");
    const isSelectedArr = useMemo(() => {
        const jsonLines = curlLines
            .filter((part): part is CurlLineJson => part.type === "json")
            .map((json) => json.line);
        return getIsSelectedArr(jsonLines, selectedProperty);
    }, [curlLines, selectedProperty]);
    const topLineAnchorIdx = isSelectedArr.findIndex((isSelected) => isSelected);

    const firstSelectedIdx = firstJsonLine > -1 && topLineAnchorIdx > -1 ? firstJsonLine + topLineAnchorIdx : undefined;

    const curlElement = <span className="text-yellow-600 dark:text-yellow-100">{CURL_PREFIX}</span>;

    const itemContent = (index: number, part: CurlLine) => {
        switch (part.type) {
            case "param": {
                const { excludeIndent = false, excludeTrailingBackslash = false } = part;
                const isLastPart = index === curlLines.length - 1;
                return (
                    <div
                        className={classNames(
                            "relative w-fit min-w-full px-4 transition whitespace-pre",
                            "bg-transparent"
                        )}
                        style={{ lineHeight: "20px", height: "20px" }}
                    >
                        {index === 0 ? curlElement : " ".repeat(excludeIndent ? 0 : CURL_PREFIX.length)}
                        <CurlParameter
                            key={index}
                            paramKey={part.paramKey}
                            value={part.value}
                            doNotStringifyValue={part.doNotStringifyValue}
                        />
                        {!excludeTrailingBackslash && !isLastPart && (
                            <span className="text-text-primary-light dark:text-text-primary-dark">{" \\"}</span>
                        )}
                    </div>
                );
            }
            case "json": {
                const isSelected = isSelectedArr[index - firstJsonLine] ?? false;
                return (
                    <div
                        className={classNames(
                            "relative w-fit min-w-full px-4 transition whitespace-pre",
                            isSelected ? "bg-accent-primary/20" : "bg-transparent"
                        )}
                        style={{ lineHeight: "20px", height: "20px" }}
                    >
                        {isSelected && <div className="bg-accent-primary absolute inset-y-0 left-0 w-1" />}
                        {index === 0 ? curlElement : " ".repeat(CURL_PREFIX.length)}
                        {renderJsonLine(part.line)}
                    </div>
                );
            }
            default:
                assertNever(part);
        }
    };

    return (
        <VirtualizedExample<CurlLine>
            data={curlLines}
            itemContent={itemContent}
            height={height}
            scrollToRow={firstSelectedIdx}
        />
    );
};
