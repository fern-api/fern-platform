import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import dynamic from "next/dynamic";
import React, { memo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FrontmatterContextProvider } from "../contexts/frontmatter";

export declare namespace MdxContent {
    export interface Props {
        mdx: FernDocs.MarkdownText | undefined;
        fallback?: React.ReactNode;
    }
}

const MdxBundlerComponent = dynamic(
    () => import("./bundlers/mdx-bundler-component").then((mod) => mod.MdxBundlerComponent),
    { ssr: true },
);

const NextMdxRemoteComponent = dynamic(
    () => import("./bundlers/next-mdx-remote-component").then((mod) => mod.NextMdxRemoteComponent),
    { ssr: true },
);

export const MdxContent = memo<MdxContent.Props>(function MdxContent({ mdx, fallback }) {
    if (
        mdx == null ||
        (typeof mdx === "string" && mdx.trim().length === 0) ||
        (typeof mdx !== "string" && mdx.code.trim().length === 0)
    ) {
        return fallback;
    }

    if (typeof mdx === "string") {
        return mdx;
    }

    const MdxComponent = mdx.engine === "mdx-bundler" ? MdxBundlerComponent : NextMdxRemoteComponent;

    return (
        <FernErrorBoundary component="MdxContent">
            <FrontmatterContextProvider value={mdx.frontmatter}>
                <MdxComponent {...mdx} />
            </FrontmatterContextProvider>
        </FernErrorBoundary>
    );
});
