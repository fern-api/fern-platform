import dynamic from "next/dynamic";
import React from "react";
import { useFeatureFlags } from "../atoms/flags";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FrontmatterContextProvider } from "./frontmatter-context";
import type { BundledMDX } from "./types";

export declare namespace MdxContent {
    export interface Props {
        mdx: BundledMDX;
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

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    const { useMdxBundler } = useFeatureFlags();

    if (typeof mdx === "string") {
        return <span className="whitespace-pre-wrap">{mdx}</span>;
    }

    const MdxComponent = useMdxBundler ? MdxBundlerComponent : NextMdxRemoteComponent;

    return (
        <FernErrorBoundary component="MdxContent">
            <FrontmatterContextProvider value={mdx.frontmatter}>
                <MdxComponent {...mdx} />
            </FrontmatterContextProvider>
        </FernErrorBoundary>
    );
});
