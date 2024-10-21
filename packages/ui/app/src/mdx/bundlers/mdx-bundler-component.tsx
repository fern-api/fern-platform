import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { createMdxComponents } from "../components";

export const MdxBundlerComponent = ({
    code,
    jsxElements,
}: Exclude<FernDocs.MarkdownText, string> & { jsxElements?: string[] }): ReactElement => {
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={createMdxComponents(jsxElements ?? [])} />;
};
