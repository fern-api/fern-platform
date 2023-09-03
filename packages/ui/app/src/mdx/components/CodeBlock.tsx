import React from "react";

export declare namespace CodeBlock {
    export interface Props {}
}

export const CodeBlock: React.FC<React.PropsWithChildren<CodeBlock.Props>> = ({ children }) => {
    return <>{children}</>;
};
