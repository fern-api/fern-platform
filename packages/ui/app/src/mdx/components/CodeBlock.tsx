import React from "react";
import { transformCodeBlockChildrenToCodeBlockItem } from "./common/util";
import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlock {
    export interface Props {
        title?: string;
        children: unknown;
        highlightLines?: (number | [number, number])[];
        highlightStyle?: "highlight" | "focus";
    }
}

export const CodeBlock: React.FC<React.PropsWithChildren<CodeBlock.Props>> = ({
    title,
    children,
    highlightLines,
    highlightStyle,
}) => {
    return (
        <_CodeBlocks
            items={[transformCodeBlockChildrenToCodeBlockItem(title, children, highlightLines, highlightStyle)]}
        />
    );
};
