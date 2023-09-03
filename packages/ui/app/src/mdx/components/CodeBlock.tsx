import React from "react";
import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlock {
    export interface Props {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: any;
        title: string;
    }
}

export const CodeBlock: React.FC<React.PropsWithChildren<CodeBlock.Props>> = ({ children, title }) => {
    return (
        <_CodeBlocks
            items={[
                {
                    children: children.props.children,
                    title: title ?? " ",
                    content: children.props.children.props.children,
                },
            ]}
        >
            {children}
        </_CodeBlocks>
    );
};
