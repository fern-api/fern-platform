import { ElementContent } from "hast";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";

interface CustomLayoutProps {
    children: ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps): ReactElement {
    return <main className="fern-prose">{children}</main>;
}

export function toCustomLayoutHastNode({ children }: { children: ElementContent[] }): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "CustomLayout",
        attributes: [],
        children,
    };
}
