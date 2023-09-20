import React from "react";
import { transformCodeBlockChildrenToCodeBlockItem } from "./common/util";
import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlock {
    export interface Props {
        title?: string;
        children: unknown;
    }
}

export const CodeBlock: React.FC<React.PropsWithChildren<CodeBlock.Props>> = ({ title, children }) => {
    return <_CodeBlocks items={[transformCodeBlockChildrenToCodeBlockItem(title, children)]} />;
};
