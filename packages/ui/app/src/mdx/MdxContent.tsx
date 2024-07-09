import { isEqual } from "lodash-es";
import dynamic from "next/dynamic";
import { memo } from "react";
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

export const MdxContent = memo<MdxContent.Props>(
    function MdxContent({ mdx }) {
        if (typeof mdx === "string") {
            return <span className="whitespace-pre-wrap">{mdx}</span>;
        }

        const MdxComponent = mdx.engine === "mdx-bundler" ? MdxBundlerComponent : NextMdxRemoteComponent;

        return (
            <FernErrorBoundary component="MdxContent">
                <FrontmatterContextProvider value={mdx.frontmatter}>
                    <MdxComponent {...mdx} />
                </FrontmatterContextProvider>
            </FernErrorBoundary>
        );
    },
    (prev, next) =>
        typeof next.mdx !== "string" && typeof prev.mdx !== "string"
            ? next.mdx.code === prev.mdx.code && isEqual(next.mdx.frontmatter, prev.mdx.frontmatter)
            : next === prev,
);
