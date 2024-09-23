import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import dynamic from "next/dynamic";
import React, { memo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FrontmatterContextProvider } from "../contexts/frontmatter";
import { FernDocsFrontmatter } from "./frontmatter";

export declare namespace MdxContent {
    export interface Props {
        mdx: ApiDefinition.Description | undefined;
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
        (mdx.type === "unresolved" && mdx.value.trim().length === 0) ||
        (mdx.type === "resolved" && mdx.code.trim().length === 0)
    ) {
        return fallback;
    }

    if (mdx.type === "unresolved") {
        return mdx.value;
    }

    const MdxComponent = mdx.engine === "mdx-bundler" ? MdxBundlerComponent : NextMdxRemoteComponent;

    return (
        <FernErrorBoundary component="MdxContent">
            <FrontmatterContextProvider value={mdx.frontmatter as FernDocsFrontmatter}>
                <MdxComponent {...mdx} />
            </FrontmatterContextProvider>
        </FernErrorBoundary>
    );
});
