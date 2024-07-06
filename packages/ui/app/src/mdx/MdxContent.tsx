import { getMDXComponent } from "mdx-bundler/client";
import React, { useMemo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import type { BundledMDX } from "./bundler";
import { FrontmatterContextProvider } from "./frontmatter-context";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "./mdx-components";

export declare namespace MdxContent {
    export interface Props {
        mdx: BundledMDX;
    }
}

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    if (typeof mdx === "string") {
        return <span className="whitespace-pre-wrap">{mdx}</span>;
    }

    return (
        <FernErrorBoundary component="MdxContent">
            <FrontmatterContextProvider value={mdx.frontmatter}>
                <MdxComponent code={mdx.code} />
            </FrontmatterContextProvider>
        </FernErrorBoundary>
    );
});

const MdxComponent = ({ code }: { code: string }) => {
    const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={COMPONENTS} />;
};
