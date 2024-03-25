import { MDXRemote } from "next-mdx-remote";
import React from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { SerializedMdxContent } from "./mdx";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "./mdx-components";

export declare namespace MdxContent {
    export interface Props {
        mdx: SerializedMdxContent;
    }
}

const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    if (typeof mdx === "string") {
        return <span className="whitespace-pre-wrap">{mdx}</span>;
    }

    if (mdx.compiledSource.trim() === "") {
        // eslint-disable-next-line no-console
        console.error("Unexpected empty compiledSource", mdx);
        return null;
    }

    return (
        <FernErrorBoundary component="MdxContent">
            <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>
        </FernErrorBoundary>
    );
});
