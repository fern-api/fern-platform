import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import type { SerializedMdxContent } from "./mdx";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "./mdx-components";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult | SerializedMdxContent | string;
    }
}

const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    const { isInlineFeedbackEnabled } = useFeatureFlags();
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
            {isInlineFeedbackEnabled && <FeedbackPopover />}
        </FernErrorBoundary>
    );
});
