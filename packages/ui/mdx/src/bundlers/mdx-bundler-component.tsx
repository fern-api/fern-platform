import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { MDX_COMPONENTS } from "../components";
import type { BundledMDX } from "../types";

export const MdxBundlerComponent = ({ code }: Exclude<BundledMDX, string>): ReactElement => {
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={MDX_COMPONENTS} />;
};
