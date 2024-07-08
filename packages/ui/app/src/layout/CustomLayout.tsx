import type { ElementContent } from "hast";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface CustomLayoutProps {
    children: ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps): ReactElement {
    return (
        <main>
            {children}

            <BuiltWithFern className="w-fit mx-auto my-8" />
        </main>
    );
}

export function toCustomLayoutHastNode({ children }: { children: ElementContent[] }): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "CustomLayout",
        attributes: [],
        children,
    };
}
