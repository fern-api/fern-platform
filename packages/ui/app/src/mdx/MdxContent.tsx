import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import React, { useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
    A,
    CodeBlock,
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
    Table,
    Td,
    Th,
    Thead,
    Tr,
    Ul,
} from "./base-components";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";
import { MdxErrorBoundaryContent } from "./MdxErrorBoundaryContent";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult;
    }
}

const COMPONENTS: MDXRemoteProps["components"] = {
    pre: CodeBlock,
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
    p: (props) => <P variant="md" {...props} />,
    P,
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    Cards,
    Card,
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
