import { MDXRemote } from "next-mdx-remote";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { MdxErrorBoundary } from "./components/MdxErrorBoundary";
import { SerializedMdxContent } from "./mdx";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "./mdx-components";

export declare namespace MdxContent {
    export interface Props {
        mdx: SerializedMdxContent;
    }
}

const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };

function MdxFallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
    return <MdxErrorBoundary error={error} resetErrorBoundary={resetErrorBoundary} />;
}

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    if (typeof mdx === "string") {
        return <>{mdx}</>;
    }

    return (
        <ErrorBoundary FallbackComponent={MdxFallbackComponent}>
            <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>
        </ErrorBoundary>
    );
});
