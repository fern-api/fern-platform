import classNames from "classnames";
import React from "react";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExampleLine {
    export interface Props {
        part: CurlExamplePart.Line;
        indentInSpaces: number;
        isLastPart: boolean;
    }
}

export const CurlExampleLine: React.FC<CurlExampleLine.Props> = ({ part, indentInSpaces, isLastPart }) => {
    const { excludeTrailingBackslash = false, excludeIndent = false } = part;

    return (
        <div className={classNames("relative w-fit min-w-full px-4 transition py-px", "bg-transparent")}>
            {" ".repeat(excludeIndent ? 0 : indentInSpaces)}
            {part.value}
            {!excludeTrailingBackslash && !isLastPart && (
                <span className="text-text-primary-light dark:text-text-primary-dark">{" \\"}</span>
            )}
        </div>
    );
};
