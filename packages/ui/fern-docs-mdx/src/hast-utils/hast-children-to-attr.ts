import type { ElementContent } from "hast";
import { toEstree } from "hast-util-to-estree";
import type { MdxJsxAttributeValueExpression } from "mdast-util-mdx-jsx";

export function hastChildrenToAttributeValueExpression(children: ElementContent[]): MdxJsxAttributeValueExpression {
    return {
        type: "mdxJsxAttributeValueExpression",
        value: "__children__",
        data: {
            estree: toEstree({
                type: "mdxJsxFlowElement",
                name: null,
                attributes: [],
                children,
            }),
        },
    };
}
