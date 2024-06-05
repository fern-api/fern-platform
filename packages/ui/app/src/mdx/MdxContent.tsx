import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary.js";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "./mdx-components.js";
import type { SerializedMdxContent } from "./mdx.js";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult | SerializedMdxContent | string;
    }
}

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };

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
            <MDXRemote
                scope={mdx.scope}
                frontmatter={mdx.frontmatter}
                compiledSource={mdx.compiledSource}
                components={COMPONENTS}
            />
        </FernErrorBoundary>
    );
});
