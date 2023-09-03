import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from "@fern-ui/app-utils";
import React, { useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
    A,
    CodeBlock as CodeBlockInternal,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    InlineCode,
    Li,
    Ol,
    P,
    Strong,
    Table,
    Td,
    Th,
    Thead,
    Tr,
    Ul,
} from "./base-components";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";
import { CodeBlock } from "./components/CodeBlock";
import { CodeBlocks } from "./components/CodeBlocks";
import { MdxErrorBoundaryContent } from "./MdxErrorBoundaryContent";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult;
    }
}

const COMPONENTS: MDXRemoteProps["components"] = {
    pre: CodeBlockInternal,
    code: InlineCode,
    table: Table,
    thead: Thead,
    tr: Tr,
    th: Th,
    td: Td,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: (props) => <P variant="markdown" {...props} />,
    P,
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    strong: Strong,
    Cards,
    Card,
    CodeBlock,
    CodeBlocks,
};

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    const fallbackRender = useCallback(({ error }: { error: unknown }) => {
        return <MdxErrorBoundaryContent error={error} />;
    }, []);

    return (
        <ErrorBoundary fallbackRender={fallbackRender}>
            <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>
        </ErrorBoundary>
    );
});
