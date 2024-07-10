import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "../mdx-components";
import type { BundledMDX } from "../types";

export const MdxBundlerComponent = ({ code }: Exclude<BundledMDX, string>): ReactElement => {
    const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };
    const Component = useMemo(() => getMDXComponent(code), [code]);
    return <Component components={COMPONENTS} />;
};
