import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { MDX_COMPONENTS } from "../components";

export const MdxBundlerComponent = ({ code }: Exclude<ApiDefinition.BundledMdx, string>): ReactElement => {
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={MDX_COMPONENTS} />;
};
