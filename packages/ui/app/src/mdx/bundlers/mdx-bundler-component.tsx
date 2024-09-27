import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { MDX_COMPONENTS } from "../components";

export const MdxBundlerComponent = ({ code }: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={MDX_COMPONENTS} />;
};
